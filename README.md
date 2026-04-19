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

| Method | Path      | Description                      |
|--------|-----------|----------------------------------|
| GET    | /user     | Fetch all users                  |
| GET    | /user/:id | Fetch a user by MongoDB ObjectId |

Example:
```bash
wget -qO- http://localhost:3000/user/6621f3a2b4e1c2d3e4f56789
```

## Environment

Create a `.env` file in the project root (never commit this):

```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/?appName=papyrus-cluster
```
