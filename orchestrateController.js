import React, { useState, useEffect } from 'react';
import { orchestrateAPI } from '../services/api';

const PROVIDER_MODELS = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
  gemini: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'],
  mistral: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  cohere: ['command-r-plus', 'command-r'],
};

const SYSTEM_PROMPT_PRESETS = {
  assistant: 'You are a helpful, accurate, and concise AI assistant.',
  researcher: 'You are an expert research analyst. Provide thorough, well-cited analysis with multiple perspectives.',
  coder: 'You are an expert software engineer. Write clean, well-documented, production-quality code.',
  debater: 'You are a skilled debater. Argue your position clearly with evidence and anticipate counterarguments.',
  critic: 'You are a critical reviewer. Identify flaws, weaknesses, and areas for improvement in responses.',
};

const DEFAULT_FORM = {
  name: '', provider: 'openai', model: 'gpt-4o',
  systemPrompt: SYSTEM_PROMPT_PRESETS.assistant,
  temperature: 0.7, maxTokens: 2048,
};

export default function AgentManager({ toast, onAgentsChange }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const loadAgents = async () => {
    try {
      const res = await orchestrateAPI.listAgents();
      setAgents(res.data.agents);
      onAgentsChange?.(res.data.agents);
    } catch {
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAgents(); }, []);

  const openEdit = (agent) => {
    setForm({
      name: agent.name,
      provider: agent.provider,
      model: agent.model,
      systemPrompt: agent.system_prompt || '',
      temperature: agent.temperature,
      maxTokens: agent.max_tokens,
    });
    setEditingId(agent.id);
    setShowCreate(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await orchestrateAPI.updateAgent(editingId, form);
        toast.success('Agent updated');
      } else {
        await orchestrateAPI.createAgent(form);
        toast.success('Agent created');
      }
      setForm(DEFAULT_FORM);
      setShowCreate(false);
      setEditingId(null);
      loadAgents();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save agent');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete agent "${name}"?`)) return;
    try {
      await orchestrateAPI.deleteAgent(id);
      toast.success('Agent deleted');
      loadAgents();
    } catch {
      toast.error('Failed to delete agent');
    }
  };

  const cancelForm = () => {
    setShowCreate(false);
    setEditingId(null);
    setForm(DEFAULT_FORM);
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div className="loading-dots"><span /><span /><span /></div>
    </div>
  );

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Agent Configurations</h2>
          <p className="text-muted text-sm">Create modular AI agents with custom models, prompts, and settings</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowCreate(!showCreate); setEditingId(null); setForm(DEFAULT_FORM); }}>
          {showCreate && !editingId ? '✕ Cancel' : '+ New Agent'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleSave} className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">{editingId ? '✏ Edit Agent' : '⚡ Create Agent'}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={cancelForm}>Cancel</button>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Agent Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Research Assistant"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Provider</label>
                <select
                  className="form-select"
                  value={form.provider}
                  onChange={(e) => setForm({ ...form, provider: e.target.value, model: PROVIDER_MODELS[e.target.value][0] })}
                >
                  {Object.keys(PROVIDER_MODELS).map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Model</label>
                <select
                  className="form-select"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                >
                  {(PROVIDER_MODELS[form.provider] || []).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Preset Prompt</label>
                <select
                  className="form-select"
                  onChange={(e) => e.target.value && setForm({ ...form, systemPrompt: SYSTEM_PROMPT_PRESETS[e.target.value] })}
                  defaultValue=""
                >
                  <option value="">Select preset...</option>
                  {Object.keys(SYSTEM_PROMPT_PRESETS).map((k) => (
                    <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">System Prompt</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Describe the agent's role and behavior..."
                value={form.systemPrompt}
                onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                style={{ resize: 'vertical', fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Temperature: {form.temperature}</label>
                <input
                  type="range" min="0" max="2" step="0.1"
                  value={form.temperature}
                  onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>Precise</span><span>Creative</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Max Tokens</label>
                <input
                  className="form-input"
                  type="number"
                  min="256" max="32000"
                  value={form.maxTokens}
                  onChange={(e) => setForm({ ...form, maxTokens: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : (editingId ? '✓ Update Agent' : '⚡ Create Agent')}
            </button>
          </div>
        </form>
      )}

      {agents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <div className="empty-title">No agents configured</div>
          <div className="empty-desc">Create your first agent to start orchestrating AI</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {agents.map((agent) => (
            <div key={agent.id} className="key-item">
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <span className={`provider-badge ${agent.provider}`}>{agent.provider}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{agent.name}</span>
                  {!agent.is_active && <span className="badge badge-red">Disabled</span>}
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span className="text-xs text-mono text-muted">{agent.model}</span>
                  <span className="text-xs text-muted">temp: {agent.temperature}</span>
                  <span className="text-xs text-muted">max: {agent.max_tokens} tokens</span>
                </div>
                {agent.system_prompt && (
                  <div className="text-xs text-muted" style={{ marginTop: 4, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>
                    "{agent.system_prompt}"
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(agent)} title="Edit">✏</button>
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(agent.id, agent.name)} title="Delete">🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
