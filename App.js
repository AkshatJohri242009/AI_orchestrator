@import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

/* ============================================
   DESIGN TOKENS - Industrial Terminal
   ============================================ */
:root {
  --bg-base: #080810;
  --bg-surface: #0e0e1a;
  --bg-elevated: #13131f;
  --bg-card: #181826;
  --bg-hover: #1e1e2e;
  --bg-active: #252538;

  --border: #2a2a40;
  --border-bright: #3d3d5c;
  --border-accent: #5b5bf6;

  --text-primary: #e8e8f0;
  --text-secondary: #8888aa;
  --text-muted: #55556a;
  --text-accent: #7b7bf8;
  --text-mono: #a8f0a8;

  --accent-primary: #5b5bf6;
  --accent-glow: rgba(91, 91, 246, 0.3);
  --accent-green: #22c55e;
  --accent-red: #ef4444;
  --accent-amber: #f59e0b;
  --accent-cyan: #06b6d4;
  --accent-purple: #a855f7;

  --provider-openai: #10a37f;
  --provider-anthropic: #d4702f;
  --provider-gemini: #4285f4;
  --provider-mistral: #ff7000;
  --provider-groq: #f55036;
  --provider-cohere: #39594d;

  --font-mono: 'Space Mono', 'Courier New', monospace;
  --font-sans: 'DM Sans', system-ui, sans-serif;

  --radius-sm: 4px;
  --radius: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  --shadow-card: 0 4px 24px rgba(0,0,0,0.4);
  --shadow-glow: 0 0 30px rgba(91,91,246,0.15);
  --transition: 150ms cubic-bezier(0.4,0,0.2,1);
}

/* ============================================
   RESET & BASE
   ============================================ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 15px; -webkit-font-smoothing: antialiased; }

body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-sans);
  line-height: 1.6;
  min-height: 100vh;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg-base); }
::-webkit-scrollbar-thumb { background: var(--border-bright); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--accent-primary); }

/* ============================================
   SPLASH / LOADING
   ============================================ */
.splash {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: var(--bg-base);
}

.splash-spinner {
  width: 40px; height: 40px;
  border: 2px solid var(--border);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ============================================
   AUTH PAGE
   ============================================ */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-base);
  position: relative;
  overflow: hidden;
}

.auth-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(91,91,246,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(91,91,246,0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

.auth-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

.auth-orb-1 {
  width: 400px; height: 400px;
  background: rgba(91,91,246,0.12);
  top: -100px; left: -100px;
}

.auth-orb-2 {
  width: 300px; height: 300px;
  background: rgba(168,85,247,0.08);
  bottom: -50px; right: -50px;
}

.auth-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  margin: 24px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 40px;
  box-shadow: var(--shadow-card), var(--shadow-glow);
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
}

.auth-logo-mark {
  width: 36px; height: 36px;
  background: var(--accent-primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 14px;
  color: white;
  letter-spacing: -1px;
}

.auth-logo-text {
  font-family: var(--font-mono);
  font-size: 15px;
  color: var(--text-primary);
  letter-spacing: 0.05em;
}

.auth-title { font-size: 22px; font-weight: 600; margin-bottom: 6px; }
.auth-subtitle { color: var(--text-secondary); font-size: 14px; margin-bottom: 28px; }

.auth-form { display: flex; flex-direction: column; gap: 16px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }

.form-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: var(--font-mono);
}

.form-input {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 11px 14px;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 14px;
  transition: border-color var(--transition), box-shadow var(--transition);
  outline: none;
  width: 100%;
}

.form-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.form-input::placeholder { color: var(--text-muted); }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: var(--radius);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  border: none;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
}

.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary {
  background: var(--accent-primary);
  color: white;
}
.btn-primary:hover:not(:disabled) {
  background: #6b6bf8;
  box-shadow: 0 4px 20px rgba(91,91,246,0.4);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border);
}
.btn-secondary:hover:not(:disabled) {
  border-color: var(--border-bright);
  background: var(--bg-hover);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}
.btn-ghost:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.btn-danger {
  background: transparent;
  color: var(--accent-red);
  border: 1px solid rgba(239,68,68,0.3);
}
.btn-danger:hover:not(:disabled) {
  background: rgba(239,68,68,0.1);
}

.btn-sm { padding: 7px 14px; font-size: 13px; }
.btn-lg { padding: 14px 28px; font-size: 15px; }
.btn-full { width: 100%; }
.btn-icon { padding: 8px; border-radius: var(--radius-sm); }

.auth-error {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: var(--radius);
  padding: 10px 14px;
  color: #fca5a5;
  font-size: 13px;
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.auth-footer a {
  color: var(--text-accent);
  text-decoration: none;
  font-weight: 500;
}

/* ============================================
   LAYOUT
   ============================================ */
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-base);
}

/* ============================================
   SIDEBAR
   ============================================ */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px 16px 16px;
  border-bottom: 1px solid var(--border);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-logo-mark {
  width: 30px; height: 30px;
  background: var(--accent-primary);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 12px;
  color: white;
}

.sidebar-logo-text {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-section-label {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  padding: 12px 8px 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition);
  color: var(--text-secondary);
  font-size: 14px;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  text-decoration: none;
}

.nav-item:hover { background: var(--bg-hover); color: var(--text-primary); }

.nav-item.active {
  background: rgba(91,91,246,0.15);
  color: var(--text-accent);
  border-left: 2px solid var(--accent-primary);
  padding-left: 8px;
}

.nav-item-icon { font-size: 15px; flex-shrink: 0; }
.nav-item-label { font-weight: 400; }

.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid var(--border);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
}

.user-avatar {
  width: 28px; height: 28px;
  background: var(--accent-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.user-details { flex: 1; min-width: 0; }
.user-name { font-size: 13px; font-weight: 500; truncate: true; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); }

/* ============================================
   MAIN CONTENT
   ============================================ */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.page-header {
  padding: 20px 28px 0;
  border-bottom: 1px solid var(--border);
  background: var(--bg-surface);
  flex-shrink: 0;
}

.page-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
}

.tab-bar {
  display: flex;
  gap: 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
}

.tab-btn:hover { color: var(--text-primary); }

.tab-btn.active {
  color: var(--text-accent);
  border-bottom-color: var(--accent-primary);
}

.page-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
}

/* ============================================
   CARDS
   ============================================ */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-body { padding: 20px; }

/* ============================================
   STATS / OVERVIEW
   ============================================ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--accent-color, var(--accent-primary));
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: var(--font-mono);
}

/* ============================================
   PROVIDER BADGES
   ============================================ */
.provider-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.provider-badge.openai { background: rgba(16,163,127,0.15); color: #10a37f; }
.provider-badge.anthropic { background: rgba(212,112,47,0.15); color: #d4702f; }
.provider-badge.gemini { background: rgba(66,133,244,0.15); color: #4285f4; }
.provider-badge.mistral { background: rgba(255,112,0,0.15); color: #ff7000; }
.provider-badge.groq { background: rgba(245,80,54,0.15); color: #f55036; }
.provider-badge.cohere { background: rgba(57,89,77,0.3); color: #4ade80; }

/* ============================================
   AGENT RESPONSE CARDS
   ============================================ */
.response-grid {
  display: grid;
  gap: 16px;
}

.response-grid.race-mode {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.response-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color var(--transition);
}

.response-card:hover { border-color: var(--border-bright); }

.response-card.winner {
  border-color: var(--accent-green);
  box-shadow: 0 0 20px rgba(34,197,94,0.1);
}

.response-card.error { border-color: rgba(239,68,68,0.4); }

.response-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border);
}

.response-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.response-card-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.response-card-body {
  padding: 16px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 400px;
  overflow-y: auto;
}

.response-card-body.code-mode {
  font-family: var(--font-mono);
  font-size: 13px;
  background: var(--bg-elevated);
}

/* ============================================
   CHAT INTERFACE
   ============================================ */
.chat-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 4px;
}

.message {
  display: flex;
  gap: 12px;
  animation: messageIn 0.2s ease-out;
}

@keyframes messageIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}

.message.user .message-avatar {
  background: var(--accent-primary);
  color: white;
}

.message.assistant .message-avatar {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  font-size: 16px;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message.user .message-bubble {
  background: rgba(91,91,246,0.15);
  border: 1px solid rgba(91,91,246,0.3);
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.message.assistant .message-bubble {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.message-time {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

/* ============================================
   PROMPT INPUT
   ============================================ */
.prompt-area {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color var(--transition), box-shadow var(--transition);
}

.prompt-area:focus-within {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.prompt-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.mode-select {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 5px 10px;
  color: var(--text-primary);
  font-size: 12px;
  font-family: var(--font-mono);
  cursor: pointer;
  outline: none;
}

.mode-select:focus { border-color: var(--accent-primary); }

.prompt-textarea {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  padding: 14px 16px;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.6;
  min-height: 80px;
  max-height: 200px;
}

.prompt-textarea::placeholder { color: var(--text-muted); }

.prompt-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-top: 1px solid var(--border);
}

.prompt-hint {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

/* ============================================
   AGENT SELECTOR
   ============================================ */
.agent-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.agent-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 100px;
  font-size: 12px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  cursor: pointer;
  transition: all var(--transition);
  user-select: none;
}

.agent-chip:hover { border-color: var(--border-bright); }

.agent-chip.selected {
  border-color: var(--accent-primary);
  background: rgba(91,91,246,0.15);
  color: var(--text-accent);
}

.agent-chip-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.8;
}

/* ============================================
   KEY MANAGER
   ============================================ */
.key-list { display: flex; flex-direction: column; gap: 8px; }

.key-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: border-color var(--transition);
}

.key-item:hover { border-color: var(--border-bright); }

.key-info { flex: 1; min-width: 0; }
.key-name { font-size: 13px; font-weight: 500; margin-bottom: 2px; }
.key-hint { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); }
.key-stats { font-size: 11px; color: var(--text-muted); }

.key-status {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.key-status.active { background: var(--accent-green); box-shadow: 0 0 6px rgba(34,197,94,0.5); }
.key-status.inactive { background: var(--text-muted); }

/* ============================================
   ADD KEY FORM
   ============================================ */
.add-key-form {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-select {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 12px;
  color: var(--text-primary);
  font-size: 14px;
  font-family: var(--font-sans);
  outline: none;
  width: 100%;
  cursor: pointer;
}

.form-select:focus { border-color: var(--accent-primary); }

/* ============================================
   MEMORY TABLE
   ============================================ */
.memory-grid { display: flex; flex-direction: column; gap: 8px; }

.memory-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: border-color var(--transition);
}

.memory-item:hover { border-color: var(--border-bright); }

.memory-key {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-accent);
  width: 160px;
  flex-shrink: 0;
  word-break: break-all;
}

.memory-value {
  flex: 1;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-primary);
  word-break: break-word;
}

.memory-category {
  font-size: 10px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  color: var(--text-muted);
  background: var(--bg-card);
  padding: 2px 6px;
  border-radius: 3px;
  flex-shrink: 0;
}

/* ============================================
   LOADING / SKELETON
   ============================================ */
.loading-dots {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.loading-dots span {
  width: 5px; height: 5px;
  background: var(--accent-primary);
  border-radius: 50%;
  animation: dotBounce 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) { animation-delay: 0s; }
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.skeleton {
  background: linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-hover) 50%, var(--bg-elevated) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ============================================
   NOTIFICATION / TOAST
   ============================================ */
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 9999;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 13px;
  box-shadow: var(--shadow-card);
  animation: toastIn 0.3s ease-out;
  max-width: 340px;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.toast.success { border-color: rgba(34,197,94,0.4); }
.toast.error { border-color: rgba(239,68,68,0.4); }
.toast.info { border-color: rgba(91,91,246,0.4); }

/* ============================================
   MODAL
   ============================================ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 480px;
  box-shadow: var(--shadow-card);
  animation: modalIn 0.2s ease-out;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.modal-title { font-size: 16px; font-weight: 600; }

.modal-body { padding: 24px; overflow-y: auto; }

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* ============================================
   MISC UTILITIES
   ============================================ */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.text-sm { font-size: 13px; }
.text-xs { font-size: 11px; }
.text-muted { color: var(--text-secondary); }
.text-accent { color: var(--text-accent); }
.text-mono { font-family: var(--font-mono); }
.font-mono { font-family: var(--font-mono); }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.divider {
  height: 1px;
  background: var(--border);
  margin: 16px 0;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-muted);
}

.empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.5; }
.empty-title { font-size: 15px; font-weight: 500; margin-bottom: 6px; color: var(--text-secondary); }
.empty-desc { font-size: 13px; }

.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono);
}

.badge-green { background: rgba(34,197,94,0.15); color: #4ade80; }
.badge-red { background: rgba(239,68,68,0.15); color: #f87171; }
.badge-amber { background: rgba(245,158,11,0.15); color: #fbbf24; }
.badge-blue { background: rgba(59,130,246,0.15); color: #60a5fa; }
.badge-purple { background: rgba(168,85,247,0.15); color: #c084fc; }

/* Scrollable code block */
pre {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
}

code {
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--bg-elevated);
  padding: 1px 5px;
  border-radius: 3px;
}
