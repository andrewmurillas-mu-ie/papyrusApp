import express, { Application } from "express";
import { createServer } from "http";
import cors from "cors";
import { connect } from "./mongo-controller";
import userRouter from "./routes/user_routes";
import authRouter from "./routes/auth_routes";
import pageRouter from "./routes/page_routes";
import pageVersionRouter from "./routes/page_version_routes";
import workspaceRouter from "./routes/workspace_routes";
import aiRouter from "./routes/ai_routes";
import "./auth/passport";
import SimpleCollaborationServer from "./collaboration/simple-collab-server";

const app: Application = express();
const server = createServer(app);
const PORT: number = (process.env.PORT as unknown as number) || 3000;

app.use(
  cors({
    origin: ["http://localhost:5174", "http://localhost:5175"],
    credentials: true,
  }),
);

app.use(express.json());

// Root route for health check
app.get("/", (req, res) => {
  res.json({ 
    message: "Papyrus API is running",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

app.use("/auth", authRouter);
app.use("/", userRouter);
app.use("/", pageRouter);
app.use("/", pageVersionRouter);
app.use("/", workspaceRouter);
app.use("/ai", aiRouter);

connect()
  .then(() => {
    console.log("Mongoose connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });

// Initialize simple collaboration server
const collaborationServer = new SimpleCollaborationServer(server);

app.listen(PORT, (): void => {
  console.log(`Server running on port ${PORT}`);
  console.log(`🚀 Real-time collaborative editing ENABLED`);
});
