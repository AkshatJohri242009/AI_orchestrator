# AI Orchestrator Dashboard

<div align="center">

![AI Orchestrator Banner](https://img.shields.io/badge/AI-Orchestrator-5b5bf6?style=for-the-badge&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A production-grade multi-user AI orchestration platform.**  
Connect multiple AI providers, run agents in parallel, compare outputs side-by-side, and store persistent memory — all secured with enterprise-grade authentication and AES-256 encryption.

[Features](#-features) · [Quick Start](#-quick-start) · [Architecture](#-architecture) · [API Reference](#-api-reference) · [Deployment](#-production-deployment) · [Security](#-security)

</div>

---

## Screenshot

```
┌─────────────────────────────────────────────────────────────────┐
│  ◈ AI Orchestrator        💬 Chat  🔬 Research  💻 Code         │
├──────────────┬──────────────────────────────────────────────────┤
│  ◈ Overview  │  AGENTS: [GPT-4o ✓] [Claude ✓] [Gemini ✓]       │
│  💬 Chat     │  MODE: ◈ Single  ⚡ Race  ⚔ Debate  ⛓ Chain     │
│  🔬 Research │  ┌─────────────────────────────────────────────┐ │
│  💻 Code     │  │ openai/gpt-4o    anthropic/claude   gemini  │ │
│              │  │ ─────────────   ──────────────────  ─────── │ │
│  🤖 Agents   │  │ Here's a...     I'd approach this...  The.. │ │
│  🔑 API Keys │  │ [2.1s · 847tok] [1.8s · 912tok]   [3.2s]   │ │
│  🧠 Memory   │  └─────────────────────────────────────────────┘ │
│              │  ┌─────────────────────────────────────────────┐ │
│  user        │  │ Ask anything...              ⌘+Enter to send│ │
└──────────────┴──────────────────────────────────────────────────┘
```

---

## ✨ Features

### Multi-Agent Orchestration
- **Single Mode** — One agent responds to your prompt
- **Race Mode ⚡** — All selected agents run in parallel; responses appear side-by-side for comparison
- **Debate Mode ⚔** — Agents argue positions across multiple rounds, each responding to the other's output
- **Chain Mode ⛓** — Output of one agent feeds into the next as a processing pipeline
- **AI Judge 🧑‍⚖️** — A third model automatically scores and ranks all responses

### Supported AI Providers
| Provider | Models |
|---|---|
| **OpenAI** | GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-3.5 Turbo |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus |
| **Google Gemini** | Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 2.0 Flash |
| **Mistral AI** | Mistral Large, Medium, Small |
| **Groq** | Llama 3.3 70B, Llama 3.1 8B, Mixtral 8x7B |
| **Cohere** | Command R+, Command R |

### Tabbed Workspaces
- **Chat** — Conversational interface with history
- **Research** — Multi-agent deep dives with comparison view
- **Code** — Side-by-side code generation from multiple models

### Security-First Architecture
- AES-256-GCM encrypted API key storage (keys never reach the frontend)
- JWT access tokens (15 min) + rotating refresh tokens (7 days) in HTTP-only cookies
- bcrypt password hashing (12 rounds)
- Per-user data isolation enforced at the database level
- Full audit trail of logins, key operations, and AI usage

### Memory System
- Persistent key-value store per user
- Categorized entries (preferences, project context, facts, goals)
- Full CRUD with search and category filtering

### Production Ready
- Docker Compose for one-command deployment
- Nginx reverse proxy with TLS, rate limiting, and security headers
- Winston structured logging with log rotation
- Graceful shutdown and connection pool management
- Account lockout after repeated failed login attempts

---

## 🚀 Quick Start

### Prerequisites
- [Node.js 20+](https://nodejs.org)
- [PostgreSQL 15+](https://www.postgresql.org/download/) (or Docker)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-orchestrator.git
cd ai-orchestrator
```

### 2. Start a database

```bash
# Option A — Docker (easiest)
docker run -d --name ai-db \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=ai_orchestrator \
  -p 5432:5432 postgres:16-alpine

# Option B — Local PostgreSQL
createdb ai_orchestrator
```

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
DB_HOST=localhost
DB_PASSWORD=devpassword

# Generate secrets (run each line separately):
# openssl rand -base64 64   →  paste as JWT_SECRET
# openssl rand -base64 64   →  paste as JWT_REFRESH_SECRET  (must differ)
# openssl rand -hex 32      →  paste as ENCRYPTION_KEY
JWT_SECRET=
JWT_REFRESH_SECRET=
ENCRYPTION_KEY=
```

> **Windows?** Use `node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"` for JWT secrets and `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` for the encryption key.

### 4. Install, migrate, and run

```bash
# Backend
cd backend
npm install
npm run migrate   # sets up all 8 database tables
npm run dev       # starts on http://localhost:3001

# Frontend (new terminal tab)
cd frontend
npm install
npm start         # opens http://localhost:3000
```

### 5. First use

1. Register an account at **http://localhost:3000**
2. Go to **API Keys** → add your provider keys (encrypted before storage)
3. Go to **Agents** → create agents with custom models and system prompts
4. Go to **Chat** → select agents, pick a mode, and start orchestrating

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   NGINX (port 80/443)                     │
│        TLS termination · Rate limiting · CSP headers      │
└────────────────┬─────────────────────┬────────────────────┘
                 │                     │
       ┌─────────▼──────┐    ┌─────────▼──────────┐
       │   React SPA    │    │   Express API       │
       │  (port 3000)   │    │   (port 3001)       │
       │                │    │                     │
       │  AuthContext   │    │  JWT Middleware      │
       │  Axios + auto  │    │  Rate Limiting       │
       │  token refresh │    │  Input Validation    │
       └────────────────┘    └─────────┬────────────┘
                                       │
                           ┌───────────▼────────────┐
                           │     PostgreSQL          │
                           │                        │
                           │  users                 │
                           │  refresh_tokens        │
                           │  api_keys (encrypted)  │
                           │  agent_configs         │
                           │  conversations         │
                           │  messages              │
                           │  user_memory           │
                           │  audit_logs            │
                           └────────────────────────┘
```

### Project Structure

```
ai-orchestrator/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Auth, Keys, Orchestrate, Memory
│   │   ├── database/             # Schema, migrations, connection pool
│   │   ├── middleware/           # JWT auth, rate limiting, validation
│   │   ├── routes/               # Express route definitions
│   │   ├── services/
│   │   │   ├── orchestrator.js   # Single / Race / Debate / Chain logic
│   │   │   └── providers.js      # Adapters for all 6 AI providers
│   │   └── utils/                # Encryption, JWT helpers, logger
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js      # Main layout + sidebar
│   │   │   ├── OrchestratePanel.js  # Chat / Research / Code tabs
│   │   │   ├── KeysManager.js    # Encrypted key vault UI
│   │   │   ├── AgentManager.js   # Agent config CRUD
│   │   │   └── MemoryManager.js  # Memory store UI
│   │   ├── services/api.js       # Axios client with auto token refresh
│   │   └── store/AuthContext.js  # Auth state + protected routes
│   ├── Dockerfile
│   └── package.json
├── docker/
│   ├── nginx.conf                # Production reverse proxy
│   └── nginx-frontend.conf       # SPA serving config
├── docker-compose.yml
└── README.md
```

---

## 🔐 Security

| Layer | Implementation |
|---|---|
| **Passwords** | bcrypt, 12 rounds — never stored in plaintext |
| **API Keys** | AES-256-GCM encrypted at rest; IV + auth tag stored separately; decrypted server-side only at call time |
| **Auth Tokens** | Short-lived JWT (15 min) + rotating refresh tokens (7 days) |
| **Token Storage** | HTTP-only cookies with `Secure` + `SameSite=Strict` flags |
| **SQL Injection** | Parameterized queries throughout — no string concatenation |
| **Rate Limiting** | Global 100 req/15min; auth endpoints 10 req/15min; AI endpoints 20 req/min |
| **Input Validation** | `express-validator` on every endpoint |
| **HTTP Headers** | Helmet.js + custom CSP, HSTS, X-Frame-Options |
| **CORS** | Restricted to configured `FRONTEND_URL` only |
| **Data Isolation** | All queries scoped to `user_id`; admins only exception |
| **Brute Force** | Account locked for 30 min after 5 failed login attempts |
| **Audit Log** | Every login attempt, key operation, and suspicious event recorded |

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Protected routes require a valid JWT (via `Authorization: Bearer <token>` header or `access_token` cookie).

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Register new user |
| `POST` | `/auth/login` | — | Login, receive tokens |
| `POST` | `/auth/logout` | ✓ | Logout + revoke refresh token |
| `POST` | `/auth/refresh` | — | Rotate access token using refresh cookie |
| `GET` | `/auth/me` | ✓ | Get current user info |

### API Keys

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/keys` | List keys (hints only, no decryption) |
| `POST` | `/keys` | Add and encrypt a new API key |
| `DELETE` | `/keys/:id` | Delete a key |
| `PATCH` | `/keys/:id/toggle` | Enable / disable a key |

### Orchestration

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/orchestrate/run` | Run agents (`mode`: single / race / debate / chain) |
| `GET` | `/orchestrate/models` | Available models for connected providers |
| `GET` | `/orchestrate/agents` | List agent configs |
| `POST` | `/orchestrate/agents` | Create agent |
| `PUT` | `/orchestrate/agents/:id` | Update agent |
| `DELETE` | `/orchestrate/agents/:id` | Delete agent |
| `GET` | `/orchestrate/conversations` | List conversations |
| `GET` | `/orchestrate/conversations/:id` | Get conversation with messages |

**Run request body:**
```json
{
  "prompt": "Explain the CAP theorem",
  "agents": ["agent-uuid-1", "agent-uuid-2"],
  "mode": "race",
  "options": {
    "judge": true,
    "saveConversation": true,
    "tabType": "research"
  }
}
```

### Memory

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/memory` | List entries (`?category=&search=`) |
| `POST` | `/memory` | Create or update a memory entry |
| `DELETE` | `/memory/:id` | Delete an entry |
| `DELETE` | `/memory/clear` | Clear all memories (requires `{ confirm: "CLEAR_ALL" }`) |
| `GET` | `/memory/categories` | Category list with counts |

---

## 🐳 Production Deployment

### 1. Generate secrets

```bash
openssl rand -base64 64   # → JWT_SECRET
openssl rand -base64 64   # → JWT_REFRESH_SECRET  (run again, must differ)
openssl rand -hex 32      # → ENCRYPTION_KEY
```

### 2. Create `.env`

```bash
cp .env.production.example .env
# Fill in all values — replace every CHANGE_ME placeholder
```

### 3. Add SSL certificates

```bash
mkdir -p docker/ssl

# Let's Encrypt (recommended for production)
certbot certonly --standalone -d your-domain.com
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/ssl/
```

### 4. Update domain in nginx config

```bash
# docker/nginx.conf — replace 'your-domain.com' with your actual domain
```

### 5. Deploy

```bash
# Without nginx (just backend + frontend exposed directly)
docker-compose up -d postgres redis backend frontend

# With nginx TLS termination (full production)
docker-compose --profile production up -d
```

### 6. Verify

```bash
curl https://your-domain.com/api/health
# → {"status":"healthy","database":"connected",...}
```

---

## 🔧 Configuration Reference

| Variable | Required | Description |
|---|---|---|
| `DB_PASSWORD` | ✅ | PostgreSQL password |
| `JWT_SECRET` | ✅ | Access token signing secret (64+ chars) |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token secret — must differ from JWT_SECRET |
| `ENCRYPTION_KEY` | ✅ | AES-256 key — exactly 64 hex characters (32 bytes) |
| `FRONTEND_URL` | ✅ | Allowed CORS origin (`http://localhost:3000` in dev) |
| `NODE_ENV` | ✅ | `development` or `production` |
| `PORT` | — | Backend port (default: `3001`) |
| `JWT_EXPIRES_IN` | — | Access token TTL (default: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | — | Refresh token TTL (default: `7d`) |
| `RATE_LIMIT_MAX_REQUESTS` | — | Requests per window (default: `100`) |
| `LOG_LEVEL` | — | Winston log level (default: `info`) |
| `REDIS_URL` | — | Redis connection string (optional) |

---

## 🧩 Adding a New AI Provider

1. Add a provider adapter function in `backend/src/services/providers.js`
2. Register it in the `PROVIDERS` object
3. Add its models to `PROVIDER_MODELS`
4. Add the provider ID to the validation allowlist in `backend/src/middleware/security.js`
5. Add a CSS badge color in `frontend/src/index.css`

---

## 📊 Monitoring

```bash
# Live backend logs
docker logs ai-orchestrator-api -f

# View audit log (recent 20 events)
psql $DATABASE_URL -c \
  "SELECT action, severity, ip_address, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 20;"

# Failed login attempts
psql $DATABASE_URL -c \
  "SELECT user_id, details, ip_address, created_at FROM audit_logs WHERE action = 'login_failed';"

# API usage per user
psql $DATABASE_URL -c \
  "SELECT u.username, ak.provider, ak.usage_count FROM api_keys ak JOIN users u ON u.id = ak.user_id ORDER BY ak.usage_count DESC;"
```

---

## 🗺 Roadmap

- [ ] WebSocket streaming for real-time token output
- [ ] Two-factor authentication (TOTP)
- [ ] Per-user API usage billing and limits dashboard
- [ ] Shareable conversation links
- [ ] Plugin system for custom agent tools
- [ ] OpenAI-compatible function calling across providers
- [ ] Team workspaces with shared agents

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow the existing code style and add tests for new features.

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with Node.js · React · PostgreSQL · Docker

⭐ Star this repo if you find it useful

</div>
