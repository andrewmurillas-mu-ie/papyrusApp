# Papyrus

A note-taking web application with a Node.js/Express backend and MongoDB database.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** MongoDB (Atlas)
- **Language:** TypeScript

## Prerequisites

- Node.js 18+
- npm

## Getting Started

### Install dependencies

```bash
npm install
```

### Run the server

```bash
npm start
```

This compiles TypeScript and starts the server. The API will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── index.ts              # App entry point, Express setup, DB export
├── mongo-controller.ts   # MongoDB client and connection
├── models/
│   └── user_model.ts     # User type and DB queries
├── controllers/
│   └── user_controller.ts # Route handler logic
└── routes/
    └── user_routes.ts    # Express router definitions
```

## API

| Method | Path        | Description                      |
|--------|-------------|----------------------------------|
| GET    | /user       | Fetch all users                  |
| GET    | /user/:id   | Fetch a user by MongoDB ObjectId |
| POST   | /user       | Create a new user                |
| PUT    | /user/:id   | Update an existing user          |
| DELETE | /user/:id   | Delete a user                    |

### Example requests

```bash
# Get all users
curl -s http://localhost:3000/user | json_pp

# Create a user
curl -s -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","passwordHash":"hashed_pw","avatarUrl":"https://example.com/jane.jpg","createdAt":"2026-04-20","updatedAt":"2026-04-20"}' | json_pp

# Get user by ID
curl -s http://localhost:3000/user/<id> | json_pp

# Update user by ID
curl -s -X PUT http://localhost:3000/user/<id> \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Smith","email":"jane.smith@example.com","passwordHash":"hashed_pw","avatarUrl":"https://example.com/jane.jpg","createdAt":"2026-04-20","updatedAt":"2026-04-20"}' | json_pp

# Delete user by ID
curl -s -X DELETE http://localhost:3000/user/<id>
```

## Environment

Create a `.env` file in the project root (never commit this):

```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/?appName=papyrus-cluster
```
