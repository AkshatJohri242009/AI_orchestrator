const bcrypt = require('bcryptjs');
const { query, withTransaction } = require('../database/db');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} = require('../utils/jwt');
const { generateSecureToken, hashToken } = require('../utils/encryption');
const logger = require('../utils/logger');

const BCRYPT_ROUNDS = 12;

// Cookie configuration
const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth',
});

const getAccessCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: '/',
});

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Check existing user
    const existing = await query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email or username already taken' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    const result = await query(
      `INSERT INTO users (email, username, password_hash, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, email, username, role, created_at`,
      [email, username, passwordHash]
    );

    const user = result.rows[0];

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);
    const refreshTokenHash = hashToken(refreshToken);

    // Store refresh token
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        user.id,
        refreshTokenHash,
        getRefreshTokenExpiry(),
        req.ip,
        req.get('User-Agent'),
      ]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (user_id, action, ip_address, details)
       VALUES ($1, 'user_registered', $2, $3)`,
      [user.id, req.ip, JSON.stringify({ email, username })]
    );

    logger.info('User registered', { userId: user.id, email });

    // Set cookies
    res.cookie('access_token', accessToken, getAccessCookieOptions());
    res.cookie('refresh_token', refreshToken, getRefreshCookieOptions());

    return res.status(201).json({
      message: 'Registration successful',
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
      accessToken, // Also send in body for clients that prefer header auth
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message, email });
    return res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await query(
      `SELECT id, email, username, password_hash, role, is_active, login_attempts, locked_until
       FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    // Generic error (don't reveal if user exists)
    if (!user) {
      logger.warn('Login attempt for non-existent user', { email, ip: req.ip });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(423).json({ error: 'Account temporarily locked due to too many failed attempts' });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account disabled' });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      // Increment login attempts
      const newAttempts = (user.login_attempts || 0) + 1;
      const lockUntil = newAttempts >= 5
        ? new Date(Date.now() + 30 * 60 * 1000) // 30 min lockout
        : null;

      await query(
        'UPDATE users SET login_attempts = $1, locked_until = $2 WHERE id = $3',
        [newAttempts, lockUntil, user.id]
      );

      await query(
        `INSERT INTO audit_logs (user_id, action, ip_address, details, severity)
         VALUES ($1, 'login_failed', $2, $3, 'warning')`,
        [user.id, req.ip, JSON.stringify({ attempts: newAttempts })]
      );

      logger.warn('Failed login attempt', { userId: user.id, attempts: newAttempts, ip: req.ip });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset login attempts on success
    await query(
      `UPDATE users SET login_attempts = 0, locked_until = NULL, last_login_at = NOW()
       WHERE id = $1`,
      [user.id]
    );

    // Revoke old refresh tokens for this device (optional - keep latest)
    const refreshToken = generateRefreshToken(user.id);
    const refreshTokenHash = hashToken(refreshToken);
    const accessToken = generateAccessToken(user);

    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, refreshTokenHash, getRefreshTokenExpiry(), req.ip, req.get('User-Agent')]
    );

    await query(
      `INSERT INTO audit_logs (user_id, action, ip_address, details)
       VALUES ($1, 'login_success', $2, $3)`,
      [user.id, req.ip, JSON.stringify({})]
    );

    logger.info('User logged in', { userId: user.id });

    res.cookie('access_token', accessToken, getAccessCookieOptions());
    res.cookie('refresh_token', refreshToken, getRefreshCookieOptions());

    return res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
      accessToken,
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    return res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * POST /api/auth/refresh
 */
const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const tokenHash = hashToken(refreshToken);

    // Check token exists and is not revoked
    const tokenResult = await query(
      `SELECT rt.id, rt.user_id, rt.expires_at, rt.is_revoked,
              u.id, u.email, u.username, u.role, u.is_active
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token_hash = $1`,
      [tokenHash]
    );

    const tokenRecord = tokenResult.rows[0];

    if (!tokenRecord || tokenRecord.is_revoked) {
      logger.warn('Revoked or invalid refresh token used', { ip: req.ip });
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    if (!tokenRecord.is_active) {
      return res.status(403).json({ error: 'User account disabled' });
    }

    // Rotate refresh token (invalidate old, issue new)
    await query('UPDATE refresh_tokens SET is_revoked = true WHERE id = $1', [tokenRecord.id]);

    const newRefreshToken = generateRefreshToken(tokenRecord.user_id);
    const newRefreshHash = hashToken(newRefreshToken);
    const newAccessToken = generateAccessToken({
      id: tokenRecord.user_id,
      email: tokenRecord.email,
      username: tokenRecord.username,
      role: tokenRecord.role,
    });

    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [tokenRecord.user_id, newRefreshHash, getRefreshTokenExpiry(), req.ip, req.get('User-Agent')]
    );

    res.cookie('access_token', newAccessToken, getAccessCookieOptions());
    res.cookie('refresh_token', newRefreshToken, getRefreshCookieOptions());

    return res.json({
      message: 'Tokens refreshed',
      accessToken: newAccessToken,
    });
  } catch (error) {
    logger.error('Token refresh error', { error: error.message });
    return res.status(500).json({ error: 'Token refresh failed' });
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;

  try {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await query(
        'UPDATE refresh_tokens SET is_revoked = true WHERE token_hash = $1',
        [tokenHash]
      );
    }

    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/auth' });

    if (req.user) {
      logger.info('User logged out', { userId: req.user.id });
    }

    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    return res.status(500).json({ error: 'Logout failed' });
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, email, username, role, created_at, last_login_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    logger.error('GetMe error', { error: error.message });
    return res.status(500).json({ error: 'Failed to get user info' });
  }
};

module.exports = { register, login, refresh, logout, getMe };
