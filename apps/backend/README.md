# Backend API - Cloudflare Workers

A scalable edge API built with Cloudflare Workers, Hono framework, and WorkOS authentication.

## 🚀 Tech Stack

- **Runtime**: Cloudflare Workers (Edge)
- **Framework**: Hono - Lightweight web framework
- **Database**: D1 (SQLite) with Drizzle ORM
- **ORM**: Drizzle - Type-safe database queries
- **KV Storage**: Cloudflare KV for key-value data
- **Authentication**: WorkOS AuthKit
- **Real-time**: Durable Objects for WebSockets
- **AI**: Workers AI integration

## 📁 Project Structure

```
src/
├── middleware/
│   ├── workos.ts     # WorkOS auth middleware
│   └── error.ts      # Error handling
├── routes/
│   ├── index.ts      # Route registration
│   ├── projects.ts   # Project endpoints
│   ├── tasks.ts      # Task endpoints
│   ├── users.ts      # User endpoints
│   ├── chat.ts       # Chat endpoints
│   ├── ai.ts         # AI endpoints
│   └── blog.ts       # Blog endpoints
├── services/
│   ├── sharded-db.service.ts    # Database sharding
│   ├── project.service.ts       # Project logic
│   └── task.service.ts          # Task logic
├── durable-objects/
│   ├── ChatRoom.ts              # Chat room state
│   └── UserSession.ts           # User session state
├── lib/
│   ├── database-router.ts       # Shard routing
│   ├── universal-id.ts          # ID generation
│   └── shard-dedup.ts           # Deduplication
└── index.ts                     # Main entry point
```

## 🔧 Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Run tests
bun run test

# Type checking
bun run typecheck

# Deploy to production
bun run deploy
```

## 🗃️ Drizzle ORM

### Database Commands
```bash
# Generate migrations from schema
bun run db:generate

# Apply migrations to D1
bun run db:migrate

# Open Drizzle Studio (GUI)
bun run db:studio

# Push schema directly (dev only)
bun run db:push
```

### Using Drizzle in Routes
```typescript
// Access database and services via middleware
app.use('*', drizzleMiddleware);

// In your route handler
app.get('/projects', async (c) => {
  const { services } = c.get('services');
  const projects = await services.projects.listProjects(userId);
  return c.json({ data: projects });
});
```

### Type-Safe Queries
```typescript
// Direct query with Drizzle
const users = await db
  .select()
  .from(users)
  .where(eq(users.email, 'user@example.com'));

// With relations
const projectsWithTasks = await db.query.projects.findMany({
  where: eq(projects.userId, userId),
  with: {
    tasks: true,
  },
});
```

## 🔐 Authentication

Uses WorkOS middleware to verify JWT tokens:

```typescript
// Protected route example
apiRoutes.use('*', workosMiddleware)

// Access user in route
const user = c.get('user')
```

## 🗄️ Database Sharding

Automatic volume-based sharding for scaling beyond D1's 10GB limit:

- Shards are created as `DB_VOL_001_<hash>`, `DB_VOL_002_<hash>`, etc.
- Universal IDs include shard information
- Cross-shard queries supported
- Zero-downtime migrations

## 🌐 Environment Variables

```bash
# Authentication
WORKOS_API_KEY=sk_...
WORKOS_CLIENT_ID=client_...
WORKOS_REDIRECT_URI=http://localhost:5173/auth/callback

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Gateway (optional)
AI_GATEWAY_ACCOUNT_ID=...
AI_GATEWAY_ID=...
```

## 📡 API Endpoints

### Projects
- `GET /api/v1/projects` - List projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/:id` - Get project
- `PATCH /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### Tasks
- `GET /api/v1/tasks` - List tasks (with filters)
- `POST /api/v1/tasks` - Create task
- `PATCH /api/v1/tasks/:id` - Update task

### AI
- `POST /api/v1/ai/chat` - Chat completion
- `POST /api/v1/ai/generate` - Text generation
- `POST /api/v1/ai/image` - Image generation
- `GET /api/v1/ai/models` - List available models

### WebSocket
- `/api/v1/chat/room/:id/websocket` - Join chat room

## 🚀 Deployment

Deployed automatically via GitHub Actions on push to main:

1. Tests run
2. Build process
3. Deploy to Cloudflare Workers
4. Update Durable Objects

## 🧪 Testing

```bash
# Run all tests
bun run test

# Run with coverage
bun run test:coverage

# Watch mode
bun run test:watch
```

## 🔍 Monitoring

- Health check: `GET /health`
- Shard monitoring: Automatic via scheduled worker
- Cloudflare Analytics integration