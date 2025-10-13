# WakaAgent AI — Frontend (Next.js)

A Next.js 15 app for WakaAgent AI: comprehensive business management with advanced AI-powered features including multilingual chat, voice transcription, intent classification, and real-time agent coordination.

## Features

### 🔐 **Authentication & Security**
- JWT-based authentication with automatic token management
- Role-based access control (RBAC) for different user types
- Secure API communication with Bearer token headers

### 🤖 **AI-Powered Features**
- **Intelligent Chat Interface** — Real-time AI conversations with context awareness
- **Voice Transcription** — Record and transcribe audio messages using Whisper
- **Multilingual Support** — Nigerian languages (Pidgin, Hausa, Yoruba, Igbo)
- **Intent Classification** — Automatic routing of user requests to appropriate AI agents
- **Streaming Responses** — Real-time AI response streaming for better UX
- **RAG Integration** — Enhanced responses with knowledge base context

### 📊 **Business Management**
- **Orders Management** — Create, track, and fulfill orders with AI assistance
- **Inventory Control** — Stock management with AI-powered forecasting
- **CRM System** — Customer relationship management with AI insights
- **Financial Tools** — Fraud detection and financial reporting
- **Reports & Analytics** — Comprehensive business intelligence

### 🔄 **Real-time Features**
- **Live Updates** — Socket.IO integration for real-time notifications
- **Collaborative Interface** — Multi-user support with live data synchronization
- **AI Agent Coordination** — Seamless interaction between different AI agents

## Prerequisites

- Node 18+
- Backend API running (FastAPI). See `backend/README.md`.

## Local Development

1. Create `.env.local`:
   ```bash
   NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api/v1
   ```
   Adjust port to match your backend (e.g., `8002`).

2. Install deps and run:
   ```bash
   npm i --legacy-peer-deps
   npm run dev
   # App on http://localhost:3000
   ```

## Environment

### Required Variables
- `NEXT_PUBLIC_API_BASE` (required): full API base including `/api/v1`.
  - Example: `https://api.yourdomain.com/api/v1`.
  - The WebSocket URL is derived from `NEXT_PUBLIC_API_BASE` origin automatically (e.g., `wss://api.yourdomain.com/ws`).

### Optional Variables
- `NEXT_PUBLIC_DEMO_BEARER` — Optional bearer token for demo-only persistence
- `NEXT_PUBLIC_AI_ENABLED` — Enable/disable AI features (default: true)
- `NEXT_PUBLIC_MULTILINGUAL_ENABLED` — Enable/disable multilingual support (default: true)

## Production (Vercel)

- Set Environment Variables in Vercel → Project → Settings:
  ```
  NEXT_PUBLIC_API_BASE=https://api.yourdomain.com/api/v1
  NEXT_PUBLIC_AI_ENABLED=true
  NEXT_PUBLIC_MULTILINGUAL_ENABLED=true
  ```
- Re-deploy after changing env vars.
- Ensure your backend CORS allows your Vercel domain and your proxy supports WebSocket upgrades to `/ws`.
- For AI features to work, ensure your backend has proper API keys configured (GROQ_API_KEY, etc.).

## Reports Downloads

- Backend must expose generated files via public URLs.
- Recommended: mount static at `/reports-files/` that serves `REPORTS_EXPORT_DIR`, and include `download_url` in `GET /admin/reports/*/latest` responses.
- The Reports tab will open `download_url` in a new tab when present.

## AI Features Usage

### Chat Interface
- **Voice Messages**: Click the microphone icon to record audio messages
- **Language Selection**: Use the language selector for multilingual conversations
- **Intent Classification**: The system automatically routes your messages to appropriate AI agents
- **Streaming Responses**: AI responses appear in real-time as they're generated

### Supported Languages
- **English** (default)
- **Nigerian Pidgin** — "How far, wetin dey happen?"
- **Hausa** — "Ina kwana, yaya aiki?"
- **Yoruba** — "Bawo ni, se alafia ni?"
- **Igbo** — "Kedu ka ị mere, ọ dị mma?"

### AI Agents
- **Orders Agent** — Handles order creation, tracking, and fulfillment
- **Inventory Agent** — Manages stock levels and provides inventory insights
- **CRM Agent** — Customer relationship management and support
- **Forecasting Agent** — Demand prediction and reorder recommendations
- **Fraud Detection Agent** — Transaction security and fraud prevention

## Notes

- If you change `NEXT_PUBLIC_API_BASE`, rebuild and redeploy.
- We do not send cookies; CORS can keep `allow_credentials` off when using Bearer tokens.
- AI features require a properly configured backend with API keys.
- Voice transcription requires microphone permissions in your browser.

## License

Apache-2.0
