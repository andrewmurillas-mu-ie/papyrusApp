import express, { Router } from "express";
import { requireAuth } from "../middleware/auth_middleware";

import {
  requestAllPages,
  requestCreatePage,
  requestDeletePage,
  requestPage,
  requestUpdatePage,
} from "../controllers/page_controller";

const router: Router = express.Router();

router.get("/page/:id", requireAuth, requestPage);

router.get("/page", requireAuth, requestAllPages);

router.post("/page", requireAuth, requestCreatePage);

router.put("/page/:id", requireAuth, requestUpdatePage);

router.delete("/page/:id", requireAuth, requestDeletePage);

export default router;
