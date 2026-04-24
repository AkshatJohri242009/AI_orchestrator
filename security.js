const { query } = require('../database/db');
const {
  encryptApiKey,
  decryptApiKey,
  packEncrypted,
  unpackEncrypted,
  getKeyHint,
} = require('../utils/encryption');
const logger = require('../utils/logger');

/**
 * GET /api/keys - List all API keys for user (no decryption)
 */
const listKeys = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, provider, label, key_hint, is_active, usage_count, usage_limit, last_used_at, created_at
       FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.json({ keys: result.rows });
  } catch (error) {
    logger.error('List keys error', { error: error.message, userId: req.user.id });
    return res.status(500).json({ error: 'Failed to list API keys' });
  }
};

/**
 * POST /api/keys - Store encrypted API key
 */
const addKey = async (req, res) => {
  const { provider, apiKey, label } = req.body;

  try {
    // Encrypt before storing
    const { encrypted, iv, tag } = encryptApiKey(apiKey);
    const packedKey = packEncrypted({ encrypted, iv, tag });
    const keyHint = getKeyHint(apiKey);

    // Extract just iv from the pack for the key_iv column
    const result = await query(
      `INSERT INTO api_keys (user_id, provider, label, encrypted_key, key_iv, key_hint)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, provider, label, key_hint, is_active, usage_count, created_at`,
      [req.user.id, provider, label || provider, packedKey, iv, keyHint]
    );

    logger.info('API key added', { userId: req.user.id, provider });

    return res.status(201).json({
      message: 'API key stored securely',
      key: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'API key with this label already exists for this provider' });
    }
    logger.error('Add key error', { error: error.message, userId: req.user.id });
    return res.status(500).json({ error: 'Failed to store API key' });
  }
};

/**
 * DELETE /api/keys/:id - Remove API key
 */
const deleteKey = async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM api_keys WHERE id = $1 AND user_id = $2 RETURNING id, provider',
      [req.params.id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'API key not found' });
    }

    logger.info('API key deleted', { userId: req.user.id, keyId: req.params.id });
    return res.json({ message: 'API key deleted' });
  } catch (error) {
    logger.error('Delete key error', { error: error.message });
    return res.status(500).json({ error: 'Failed to delete API key' });
  }
};

/**
 * PATCH /api/keys/:id/toggle - Enable/disable key
 */
const toggleKey = async (req, res) => {
  try {
    const result = await query(
      `UPDATE api_keys SET is_active = NOT is_active
       WHERE id = $1 AND user_id = $2
       RETURNING id, provider, label, is_active`,
      [req.params.id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'API key not found' });
    }

    return res.json({ key: result.rows[0] });
  } catch (error) {
    logger.error('Toggle key error', { error: error.message });
    return res.status(500).json({ error: 'Failed to toggle API key' });
  }
};

/**
 * Internal: Retrieve and decrypt API key for a user+provider
 * Used by AI orchestration service only - never exposed as API
 */
const getDecryptedKey = async (userId, provider) => {
  const result = await query(
    `SELECT encrypted_key, key_iv FROM api_keys
     WHERE user_id = $1 AND provider = $2 AND is_active = true
     ORDER BY created_at DESC LIMIT 1`,
    [userId, provider]
  );

  if (!result.rows[0]) {
    throw new Error(`No active API key found for provider: ${provider}`);
  }

  const { encrypted_key, key_iv } = result.rows[0];
  const { encrypted, iv, tag } = unpackEncrypted(encrypted_key);

  return decryptApiKey(encrypted, iv, tag);
};

/**
 * Increment usage counter
 */
const incrementUsage = async (keyId) => {
  await query(
    'UPDATE api_keys SET usage_count = usage_count + 1, last_used_at = NOW() WHERE id = $1',
    [keyId]
  );
};

module.exports = { listKeys, addKey, deleteKey, toggleKey, getDecryptedKey, incrementUsage };
