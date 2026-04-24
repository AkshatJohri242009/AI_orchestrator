import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { orchestrateAPI } from '../services/api';
import { useToast, ToastContainer } from '../hooks/useToast';
import KeysManager from './KeysManager';
import AgentManager from './AgentManager';
import OrchestratePanel from './OrchestratePanel';
import MemoryManager from './MemoryManager';

const NAV_ITEMS = [
  { id: 'chat', label: 'Chat', icon: '💬', section: 'Orchestrate' },
  { id: 'research', label: 'Research', icon: '🔬', section: 'Orchestrate' },
  { id: 'code', label: 'Code', icon: '💻', section: 'Orchestrate' },
  { id: 'agents', label: 'Agents', icon: '🤖', section: 'Configure' },
  { id: 'keys', label: 'API Keys', icon: '🔑', section: 'Configure' },
  { id: 'memory', label: 'Memory', icon: '🧠', section: 'Configure' },
];

const SECTIONS = ['Orchestrate', 'Configure'];

function Overview({ agents, conversations }) {
  const activeAgents = agents.filter((a) => a.is_active !== false).length;

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card" style={{ '--accent-color': 'var(--accent-primary)' }}>
          <div className="stat-value">{agents.length}</div>
          <div className="stat-label">Agents</div>
        </div>
        <div className="stat-card" style={{ '--accent-color': 'var(--accent-green)' }}>
          <div className="stat-value">{activeAgents}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card" style={{ '--accent-color': 'var(--accent-cyan)' }}>
          <div className="stat-value">{conversations.length}</div>
          <div className="stat-label">Conversations</div>
        </div>
        <div className="stat-card" style={{ '--accent-color': 'var(--accent-amber)' }}>
          <div className="stat-value">{[...new Set(agents.map((a) => a.provider))].length}</div>
          <div className="stat-label">Providers</div>
        </div>
      </div>

      {/* Quick-start guide */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">⚡ Quick Start</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { step: '1', title: 'Add API Keys', desc: 'Go to API Keys → securely add your OpenAI, Anthropic, Gemini keys', done: false },
              { step: '2', title: 'Create Agents', desc: 'Go to Agents → create agent configs with custom models and prompts', done: agents.length > 0 },
              { step: '3', title: 'Orchestrate', desc: 'Go to Chat/Research/Code → select agents, choose a mode (Race/Single/Debate)', done: conversations.length > 0 },
            ].map((item) => (
              <div key={item.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: item.done ? 'var(--accent-green)' : 'var(--bg-elevated)',
                  border: `1px solid ${item.done ? 'var(--accent-green)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: item.done ? 'white' : 'var(--text-muted)',
                }}>
                  {item.done ? '✓' : item.step}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{item.title}</div>
                  <div className="text-sm text-muted">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent conversations */}
      {conversations.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">📜 Recent Conversations</span>
          </div>
          <div className="card-body" style={{ padding: '8px 0' }}>
            {conversations.slice(0, 8).map((conv) => (
              <div key={conv.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 20px',
                borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 14 }}>
                  {conv.tab_type === 'research' ? '🔬' : conv.tab_type === 'code' ? '💻' : '💬'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="truncate" style={{ fontSize: 13, fontWeight: 500 }}>{conv.title}</div>
                  <div className="text-xs text-muted">{new Date(conv.updated_at).toLocaleString()}</div>
                </div>
                <span className={`badge ${conv.mode === 'race' ? 'badge-amber' : conv.mode === 'debate' ? 'badge-purple' : 'badge-blue'}`}>
                  {conv.mode}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toasts, toast } = useToast();
  const [activeTab, setActiveTab] = useState('chat');
  const [agents, setAgents] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    orchestrateAPI.listAgents()
      .then((r) => setAgents(r.data.agents))
      .catch(() => {});
    orchestrateAPI.listConversations()
      .then((r) => setConversations(r.data.conversations))
      .catch(() => {});
  }, []);

  const PAGE_TITLES = {
    chat: 'Chat', research: 'Research', code: 'Code Generation',
    agents: 'Agent Configurations', keys: 'API Key Vault', memory: 'Memory Store',
    overview: 'Dashboard',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
      case 'research':
      case 'code':
        return <OrchestratePanel agents={agents} tabType={activeTab} toast={toast} />;
      case 'agents':
        return <AgentManager toast={toast} onAgentsChange={setAgents} />;
      case 'keys':
        return <KeysManager toast={toast} />;
      case 'memory':
        return <MemoryManager toast={toast} />;
      default:
        return <Overview agents={agents} conversations={conversations} />;
    }
  };

  const isOrchestrateTab = ['chat', 'research', 'code'].includes(activeTab);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-mark">AO</div>
            <span className="sidebar-logo-text">Orchestrator</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="nav-item-icon">◈</span>
            <span className="nav-item-label">Overview</span>
          </button>

          {SECTIONS.map((section) => (
            <div key={section}>
              <div className="nav-section-label">{section}</div>
              {NAV_ITEMS.filter((n) => n.section === section).map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  <span className="nav-item-label">{item.label}</span>
                  {item.id === 'agents' && agents.length > 0 && (
                    <span style={{
                      marginLeft: 'auto', fontSize: 10,
                      background: 'var(--bg-elevated)', padding: '1px 6px',
                      borderRadius: 10, color: 'var(--text-muted)',
                    }}>{agents.length}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
            <div className="user-details">
              <div className="user-name">{user?.username}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={logout} title="Sign out" style={{ fontSize: 14 }}>
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="page-header">
          <div className="page-title-row">
            <h1 className="page-title">
              {NAV_ITEMS.find((n) => n.id === activeTab)?.icon || '◈'}&nbsp;
              {PAGE_TITLES[activeTab] || 'Dashboard'}
            </h1>

            {isOrchestrateTab && (
              <div className="flex gap-2 items-center">
                <span className="text-xs text-muted">
                  {agents.filter((a) => a.is_active !== false).length} agents ready
                </span>
              </div>
            )}
          </div>

          {isOrchestrateTab && (
            <div className="tab-bar">
              {[
                { id: 'chat', label: '💬 Chat' },
                { id: 'research', label: '🔬 Research' },
                { id: 'code', label: '💻 Code' },
              ].map((t) => (
                <button
                  key={t.id}
                  className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="page-body">{renderContent()}</div>
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
