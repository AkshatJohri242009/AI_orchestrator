import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function AuthPage({ mode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.username, form.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-grid" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">AO</div>
          <span className="auth-logo-text">AI Orchestrator</span>
        </div>

        <h1 className="auth-title">{isLogin ? 'Welcome back' : 'Create account'}</h1>
        <p className="auth-subtitle">
          {isLogin ? 'Sign in to your orchestration dashboard' : 'Start orchestrating AI agents'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                type="text"
                placeholder="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9]+"
                autoComplete="username"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder={isLogin ? '••••••••' : 'Min 8 chars, uppercase, number, special'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <div className="auth-error">⚠ {error}</div>}

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? (
              <span className="loading-dots"><span /><span /><span /></span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <>Don't have an account? <Link to="/register">Sign up</Link></>
          ) : (
            <>Already have an account? <Link to="/login">Sign in</Link></>
          )}
        </div>

        {isLogin && (
          <div className="auth-footer" style={{ marginTop: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Demo: create an account to get started
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
