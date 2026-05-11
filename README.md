# RequestHub — Internal Feature Request & Approval Portal

A full-stack internal tool for submitting, tracking, and approving feature
requests. Built for teams that need visibility into business requests and a
structured approval workflow.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 · TypeScript · Vite · Tailwind CSS |
| Backend   | Express.js · TypeScript · Prisma ORM |
| Database  | PostgreSQL 16                       |
| Testing   | Playwright (e2e) · Vitest (unit)    |
| CI        | GitHub Actions                      |

## Project Structure

```
requesthub/
├── client/             React frontend (Vite)
│   └── src/
│       ├── components/ Reusable UI components
│       ├── pages/      Route-level pages
│       ├── context/    React context (auth, etc.)
│       ├── hooks/      Custom hooks
│       └── lib/        Utilities & API client
├── server/             Express backend
│   └── src/
│       ├── routes/     API route handlers
│       ├── services/   Business logic
│       └── middleware/  Auth, error handling
├── prisma/             Database schema & migrations
├── e2e/                Playwright end-to-end tests
└── docker-compose.yml  Local Postgres
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for Postgres)

### Setup

```bash
# 1. Start Postgres
docker compose up -d

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Run database migrations & seed
npx prisma migrate deploy
npx prisma db seed

# 5. Start dev servers (backend + frontend)
npm run dev
```

The frontend runs at **http://localhost:5173** and the API at **http://localhost:3001**.

### Running Tests

```bash
# Unit tests
npm run test

# End-to-end tests (requires app running)
npm run e2e

# E2E with UI
npm run e2e:ui
```

## Approval Workflow

Requests follow this lifecycle:

```
Submitted → Under Review → Approved → In Progress → Done
                         ↘ Rejected
```

- **Submitted**: Initial state when a request is created
- **Under Review**: A reviewer has picked up the request
- **Approved / Rejected**: Review decision
- **In Progress**: Work has started on an approved request
- **Done**: Feature delivered

## API Endpoints

| Method | Path                      | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/requests`           | List all requests        |
| GET    | `/api/requests/:id`       | Get request by ID        |
| POST   | `/api/requests`           | Create a new request     |
| PATCH  | `/api/requests/:id`       | Update request           |
| PATCH  | `/api/requests/:id/status`| Transition status        |
| GET    | `/api/requests/:id/comments` | List comments         |
| POST   | `/api/requests/:id/comments` | Add a comment          |
| POST   | `/api/auth/login`         | Login                    |
| GET    | `/api/auth/me`            | Current user             |

## Seed Data

The seed script creates:
- 3 users (admin, reviewer, requester)
- 12 sample feature requests in various states
- Sample comments on several requests

Login credentials (dev only):
- **Admin**: `admin@requesthub.dev` / `admin123`
- **Reviewer**: `reviewer@requesthub.dev` / `reviewer123`
- **Requester**: `requester@requesthub.dev` / `requester123`
