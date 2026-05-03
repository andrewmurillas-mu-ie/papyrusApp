import express, { Router } from "express";
import { requireAuth } from "../middleware/auth_middleware";
import {
  requestAllWorkspaces,
  requestCreateWorkspace,
  requestDeleteWorkspace,
  requestUpdateWorkspace,
  requestWorkspace,
} from "../controllers/workspace_controller";

const router: Router = express.Router();

router.get("/workspace", requireAuth, requestAllWorkspaces);
router.get("/workspace/:id", requireAuth, requestWorkspace);
router.post("/workspace", requireAuth, requestCreateWorkspace);
router.put("/workspace/:id", requireAuth, requestUpdateWorkspace);
router.delete("/workspace/:id", requireAuth, requestDeleteWorkspace);

export default router;