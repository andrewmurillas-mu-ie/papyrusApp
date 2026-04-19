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

| Method | Path    | Description        |
|--------|---------|--------------------|
| GET    | /user   | Fetch a user by ID |

## Environment

The MongoDB connection URI is currently hardcoded in `src/mongo-controller.ts`. Before deploying, move it to an environment variable:

```ts
const uri = process.env.MONGO_URI!;
```

And create a `.env` file (never commit this):

```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/?appName=papyrus-cluster
```
