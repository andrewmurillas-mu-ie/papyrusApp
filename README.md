# Papyrus

A note-taking web application with a Node.js/Express backend and MongoDB database.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** MongoDB (Atlas)
- **Language:** TypeScript
- **Auth:** GitHub OAuth 2.0 + JWT

## Prerequisites

- Node.js 18+
- npm

## Getting Started

### Install dependencies

```bash
npm install
```

### Configure environment

Create a `.env` file in the project root (never commit this):

```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/?appName=papyrus-cluster
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
JWT_SECRET=any_long_random_string
```

Get `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` by registering an OAuth App at github.com/settings/developers with callback URL `http://localhost:3000/auth/github/callback`. Share all three values privately with teammates — never commit them.

### Run the server

```bash
npm start
```

This compiles TypeScript and starts the server at `http://localhost:3000`.

## Project Structure

```
src/
├── index.ts                    # App entry point, Express setup, DB export
├── mongo-controller.ts         # MongoDB client and connection
├── auth/
│   └── passport.ts             # GitHub OAuth strategy
├── middleware/
│   └── auth_middleware.ts      # JWT verification middleware
├── models/
│   └── user_model.ts           # User type and DB queries
├── controllers/
│   └── user_controller.ts      # Route handler logic
└── routes/
    ├── auth_routes.ts          # Auth routes
    └── user_routes.ts          # User CRUD routes
```

## Authentication

Login is handled via GitHub OAuth. The flow:

1. Direct the user to `GET /auth/github`
2. GitHub redirects back to `/auth/github/callback`
3. The server returns a JWT, e.g.:
   ```json
   { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..." }
   ```
4. Save that token on the client. Every protected API request must include it as an HTTP header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
   ```
   `Bearer` is a standard keyword that tells the server the token follows — it is not part of the token itself.

## API

### Auth

| Method | Path                    | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | /auth/github            | Redirect to GitHub login           |
| GET    | /auth/github/callback   | GitHub callback, returns JWT       |

### Users

| Method | Path        | Description                      |
|--------|-------------|----------------------------------|
| GET    | /user       | Fetch all users                  |
| GET    | /user/:id   | Fetch a user by MongoDB ObjectId |
| POST   | /user       | Create a new user                |
| PUT    | /user/:id   | Update an existing user          |
| DELETE | /user/:id   | Delete a user                    |

### Example requests

```bash
# Login — open in browser, returns a JWT
open http://localhost:3000/auth/github

# Get all users (with auth)
curl -s http://localhost:3000/user \
  -H "Authorization: Bearer <token>" | json_pp

# Create a user
curl -s -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Jane Doe","email":"jane@example.com","avatarUrl":"https://example.com/jane.jpg","createdAt":"2026-04-20","updatedAt":"2026-04-20"}' | json_pp

# Get user by ID
curl -s http://localhost:3000/user/<id> \
  -H "Authorization: Bearer <token>" | json_pp

# Update user by ID
curl -s -X PUT http://localhost:3000/user/<id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Jane Smith","email":"jane.smith@example.com","avatarUrl":"https://example.com/jane.jpg","createdAt":"2026-04-20","updatedAt":"2026-04-20"}' | json_pp

# Delete user by ID
curl -s -X DELETE http://localhost:3000/user/<id> \
  -H "Authorization: Bearer <token>"
```
