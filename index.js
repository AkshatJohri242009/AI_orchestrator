version: '3.9'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: ai-orchestrator-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME:-ai_orchestrator}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:?DB_PASSWORD required}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/src/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  # Redis (optional - for caching/rate limiting)
  redis:
    image: redis:7-alpine
    container_name: ai-orchestrator-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ai-orchestrator-api
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD}@postgres:5432/${DB_NAME:-ai_orchestrator}
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME:-ai_orchestrator}
      DB_USER: ${DB_USER:-postgres}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET:?JWT_SECRET required}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:?JWT_REFRESH_SECRET required}
      ENCRYPTION_KEY: ${ENCRYPTION_KEY:?ENCRYPTION_KEY required}
      FRONTEND_URL: ${FRONTEND_URL:-http://localhost:3000}
      REDIS_URL: redis://redis:6379
    ports:
      - "3001:3001"
    volumes:
      - backend_logs:/app/logs
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        REACT_APP_API_URL: ${REACT_APP_API_URL:-http://localhost:3001/api}
    container_name: ai-orchestrator-frontend
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "3000:80"
    networks:
      - app-network

  # Nginx reverse proxy (production)
  nginx:
    image: nginx:alpine
    container_name: ai-orchestrator-nginx
    restart: unless-stopped
    depends_on:
      - backend
      - frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/ssl:/etc/nginx/ssl:ro
      - nginx_cache:/var/cache/nginx
    networks:
      - app-network
    profiles:
      - production

volumes:
  postgres_data:
  redis_data:
  backend_logs:
  nginx_cache:

networks:
  app-network:
    driver: bridge
