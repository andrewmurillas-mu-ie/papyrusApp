import express, { Application } from "express";
import cors from "cors";
import { connect } from "./mongo-controller";
import userRouter from "./routes/user_routes";
import authRouter from "./routes/auth_routes";
import pageRouter from "./routes/page_routes";
import workspaceRouter from "./routes/workspace_routes";
import aiRouter from "./routes/ai_routes";
import "./auth/passport";

const app: Application = express();
const PORT: number = (process.env.PORT as unknown as number) || 3000;

app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true,
  }),
);

app.use(express.json());

app.use("/auth", authRouter);
app.use("/", userRouter);
app.use("/", pageRouter);
app.use("/", workspaceRouter);
app.use("/ai", aiRouter);

connect()
  .then(() => {
    console.log("Mongoose connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });

app.listen(PORT, (): void => {
  console.log(`Server running on port ${PORT}`);
});
