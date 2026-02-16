# WakaAgent AI — Frontend

Next.js frontend for WakaAgent AI — an AI-powered distribution management system for Nigerian businesses. Features a modern dashboard, AI chat with multilingual support, order management, inventory tracking, and realtime updates.

---

## Quick Start (for your deployment partner)

```bash
# 1. Enter the frontend directory
cd WakaAgentAI/frontend

# 2. Create environment file
cat > .env.local << EOF
NEXT_PUBLIC_BACKEND_BASE=http://localhost:8000
NEXT_PUBLIC_API_BASE=http://localhost:8000/api/v1
EOF

# 3. Install dependencies
npm install --legacy-peer-deps

# 4. Start dev server
npm run dev
```

**App running at**: http://localhost:3000

**Login**: `admin@example.com` / `admin123` (seeded by backend on first startup)

> **Important**: The backend must be running first. See `backend/README.md`.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Comes with Node.js |
| Backend API | Running | Must be accessible at the URL in `.env.local` |

---

## Environment Variables

Create `frontend/.env.local`:

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_BACKEND_BASE` | **Yes** | `http://localhost:8000` | Backend base URL (used for Socket.IO) |
| `NEXT_PUBLIC_API_BASE` | **Yes** | `http://localhost:8000/api/v1` | Full API base URL |
| `NEXT_PUBLIC_DEMO_BEARER` | No | `eyJhbGci...` | Optional fixed bearer token for demos |
| `NEXT_PUBLIC_AI_ENABLED` | No | `true` | Enable/disable AI features (default: true) |
| `NEXT_PUBLIC_MULTILINGUAL_ENABLED` | No | `true` | Enable/disable multilingual support (default: true) |

---

## Deploy to Netlify

A `netlify.toml` is included for easy deployment.

### Step-by-Step

1. Push the repo to GitHub
2. Go to [Netlify](https://app.netlify.com) → **Add new site** → **Import from Git**
3. Connect your GitHub repo
4. Configure build settings:

| Setting | Value |
|---------|-------|
| **Base directory** | `frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `frontend/.next` |

5. Set environment variables in Netlify → **Site settings** → **Environment variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_BACKEND_BASE` | Your Render backend URL (e.g. `https://wakaagent-backend.onrender.com`) |
| `NEXT_PUBLIC_API_BASE` | `https://wakaagent-backend.onrender.com/api/v1` |

6. Click **Deploy site**

### After Deploying

**Update backend CORS**: Go to your Render backend service → **Environment** → add your Netlify URL to `CORS_ORIGINS`:

```
CORS_ORIGINS=https://your-app.netlify.app
```

Then redeploy the backend for the change to take effect.

---

## Features

### Pages

| Page | Path | Description |
|------|------|-------------|
| Landing | `/` | Public landing page |
| Dashboard | `/dashboard` | KPI cards, charts, business overview |
| Chat | `/chat` | AI chat with language selector & voice |
| Orders | `/orders` | Order list + creation wizard |
| CRM | `/crm` | Customer management |
| Inventory | `/inventory` | Stock levels & warehouse management |
| Finance | `/finance` | Debts, payments, fraud alerts |
| Support | `/support` | Help & support tickets |
| Admin | `/admin` | User management, roles, reports |
| Settings | `/settings` | App configuration |

### AI Chat Features

- **Multilingual**: English, Nigerian Pidgin, Hausa, Yoruba, Igbo
- **Voice Input**: Click microphone icon to record audio messages
- **Streaming**: AI responses appear in real-time
- **7 AI Agents**: Orders, Inventory, CRM, Forecasting, Fraud Detection, Finance — auto-routed by intent

### Realtime

- Socket.IO connects to backend at `/ws` path
- Namespaces: `/chat` (messages), `/orders` (order updates)
- Auto-reconnects on connection loss

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | React framework (App Router) |
| React 18 | UI library |
| TypeScript | Type safety |
| TailwindCSS v4 | Styling |
| shadcn/ui (Radix) | Component library |
| Recharts | Dashboard charts |
| Lucide | Icons |
| Socket.IO Client | Realtime communication |
| Zod | Schema validation |

---

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

Tests use **Jest** + **React Testing Library**.

---

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── dashboard/          # Dashboard with KPI cards
│   ├── chat/               # AI chat interface
│   ├── orders/             # Order management
│   ├── crm/                # Customer management
│   ├── inventory/          # Stock management
│   ├── finance/            # Financial tools
│   ├── support/            # Support tickets
│   ├── admin/              # Admin panel
│   └── settings/           # App settings
├── components/             # React components
│   ├── chat/               # Chat interface, message bubbles
│   ├── orders/             # Order wizard, order list
│   ├── ui/                 # shadcn/ui base components
│   └── ...                 # Dashboard, CRM, inventory components
├── lib/                    # Utilities
│   ├── api.ts              # API helpers (auto-attaches JWT from localStorage)
│   ├── realtime.ts         # Socket.IO client helper
│   └── utils.ts            # General utilities
├── hooks/                  # Custom React hooks
├── styles/                 # Global styles
├── __tests__/              # Jest test files
├── package.json            # Dependencies
├── netlify.toml            # Netlify deployment config
├── jest.config.js          # Jest configuration
├── tsconfig.json           # TypeScript config
└── next.config.mjs         # Next.js config
```

---

## Key Files

| File | Purpose |
|------|---------|
| `lib/api.ts` | `postJSON`/`getJSON` helpers — auto-attaches JWT from `localStorage` |
| `lib/realtime.ts` | Socket.IO client — connects to `/chat` namespace at `/ws` path |
| `components/chat/chat-interface.tsx` | Main chat UI with language selector & voice |
| `components/orders/order-wizard.tsx` | Step-by-step order creation |
| `netlify.toml` | Netlify build & plugin config |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **npm install fails** | Use `npm install --legacy-peer-deps` |
| **API calls return 401** | Login first — JWT is stored in `localStorage.access_token` |
| **API calls return 404** | Check `NEXT_PUBLIC_API_BASE` points to running backend |
| **Socket.IO not connecting** | Verify `NEXT_PUBLIC_BACKEND_BASE` and backend CORS includes your frontend URL |
| **Blank page after deploy** | Ensure env vars are set in Netlify and site is redeployed |
| **Chat not working** | Backend needs `GROQ_API_KEY` set for AI features |
| **Voice not working** | Browser needs microphone permission; Whisper service must be running on backend |

---

## License

Apache-2.0
