# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build   # Compile TypeScript → dist/
npm start       # Build and run the server (tsc && node dist/index.js)
```

No test suite is configured.

## Environment Variables

Requires a `.env` file (not committed):

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `PORT` | Server port (defaults to 3000) |

## Architecture

Express 5 + TypeScript REST API backed by MongoDB Atlas, using GitHub OAuth 2.0 for authentication and JWT tokens for session management.

**Request flow:**
1. `src/index.ts` — entry point; wires up Express, connects to MongoDB, registers route prefixes (`/auth`, `/user`)
2. `src/routes/` — route definitions delegate to controllers
3. `src/controllers/user_controller.ts` — handles request/response logic
4. `src/models/user_model.ts` — defines the `User` interface and all DB query functions (`getUser`, `getAllUsers`, `createUser`, `updateUser`, `deleteUser`, `getUserByGithubId`)
5. `src/mongo-controller.ts` — manages the shared `MongoClient` instance

**Auth flow:**
- `GET /auth/github` → redirects to GitHub OAuth
- `GET /auth/github/callback` → Passport strategy (`src/auth/passport.ts`) looks up or creates the user by GitHub ID, then signs a 7-day JWT and returns it to the client
- Protected routes use the `requireAuth` middleware (`src/middleware/auth_middleware.ts`), which validates `Authorization: Bearer <token>` headers

**Compiled output** goes to `dist/` (mirrors `src/` structure). TypeScript target is ES2017, module system is CommonJS.