import React, { useState, useEffect } from 'react';
import { keysAPI } from '../services/api';

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', desc: 'GPT-4o, GPT-4 Turbo' },
  { id: 'anthropic', name: 'Anthropic', desc: 'Claude 3.5 Sonnet, Opus' },
  { id: 'gemini', name: 'Google Gemini', desc: 'Gemini 1.5 Pro, Flash' },
  { id: 'mistral', name: 'Mistral AI', desc: 'Mistral Large, Medium' },
  { id: 'groq', name: 'Groq', desc: 'Llama 3.3, Mixtral (fast)' },
  { id: 'cohere', name: 'Cohere', desc: 'Command R+' },
];

export default function KeysManager({ toast }) {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ provider: 'openai', apiKey: '', label: '' });
  const [saving, setSaving] = useState(false);

  const loadKeys = async () => {
    try {
      const res = await keysAPI.list();
      setKeys(res.data.keys);
    } catch {
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadKeys(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await keysAPI.add(form);
      toast.success(`${form.provider} API key added securely`);
      setForm({ provider: 'openai', apiKey: '', label: '' });
      setShowAdd(false);
      loadKeys();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add key');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, provider) => {
    if (!window.confirm(`Delete ${provider} API key?`)) return;
    try {
      await keysAPI.delete(id);
      toast.success('API key deleted');
      loadKeys();
    } catch {
      toast.error('Failed to delete key');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await keysAPI.toggle(id);
      setKeys((prev) => prev.map((k) => k.id === id ? { ...k, is_active: res.data.key.is_active } : k));
    } catch {
      toast.error('Failed to toggle key');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : 'Never';

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div className="loading-dots"><span /><span /><span /></div>
    </div>
  );

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>API Key Vault</h2>
          <p className="text-muted text-sm">Keys are encrypted with AES-256 before storage. Never exposed to frontend.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? '✕ Cancel' : '+ Add Key'}
        </button>
      </div>

      {showAdd && (
        <form className="add-key-form" onSubmit={handleAdd} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
            🔐 Add Encrypted API Key
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Provider</label>
              <select
                className="form-select"
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
              >
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Label (optional)</label>
              <input
                className="form-input"
                placeholder="e.g. Production Key"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">API Key</label>
            <input
              className="form-input"
              type="password"
              placeholder="sk-... or your API key"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              required
              minLength={10}
              autoComplete="off"
            />
            <span className="text-xs text-muted" style={{ marginTop: 4 }}>
              Encrypted server-side. Only the last 4 characters are stored for identification.
            </span>
          </div>
          <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
            {saving ? 'Encrypting & Saving...' : '🔒 Save Encrypted Key'}
          </button>
        </form>
      )}

      {keys.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔑</div>
          <div className="empty-title">No API keys yet</div>
          <div className="empty-desc">Add your first API key to start using AI agents</div>
        </div>
      ) : (
        <div className="key-list">
          {keys.map((key) => {
            const provider = PROVIDERS.find((p) => p.id === key.provider);
            return (
              <div key={key.id} className="key-item">
                <div className={`key-status ${key.is_active ? 'active' : 'inactive'}`} title={key.is_active ? 'Active' : 'Inactive'} />
                <div className="key-info">
                  <div className="flex items-center gap-2">
                    <span className={`provider-badge ${key.provider}`}>{key.provider}</span>
                    <span className="key-name">{key.label || provider?.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    <span className="key-hint">...{key.key_hint}</span>
                    <span className="key-stats">Used {key.usage_count}× · Last: {formatDate(key.last_used_at)}</span>
                    <span className="key-stats">Added: {formatDate(key.created_at)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => handleToggle(key.id)}
                    title={key.is_active ? 'Disable' : 'Enable'}
                  >
                    {key.is_active ? '⏸' : '▶'}
                  </button>
                  <button
                    className="btn btn-danger btn-sm btn-icon"
                    onClick={() => handleDelete(key.id, key.provider)}
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(91,91,246,0.06)', border: '1px solid rgba(91,91,246,0.2)', borderRadius: 'var(--radius)', fontSize: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-accent)' }}>🛡 Security Architecture</div>
        <div className="text-muted" style={{ lineHeight: 1.7 }}>
          Keys encrypted with AES-256-GCM before DB storage • IV + auth tag stored separately •
          Keys decrypted only during API calls (server-side) • Never sent to frontend •
          Per-user isolation enforced at database level
        </div>
      </div>
    </div>
  );
}
