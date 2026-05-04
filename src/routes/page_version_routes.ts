import express, { Router } from "express";
import { requireAuth } from "../middleware/auth_middleware";
import {
  requestPageVersions,
  requestPageVersion,
  requestRestorePageVersion,
} from "../controllers/page_version_controller";

const router: Router = express.Router();

router.get("/page/:pageId/versions", requireAuth, requestPageVersions);
router.get("/page/:pageId/versions/:version", requireAuth, requestPageVersion);
router.post("/page/:pageId/versions/:version/restore", requireAuth, requestRestorePageVersion);

export default router;
