import express, { Router } from "express";
import {
  requestAllPages,
  requestCreatePage,
  requestDeletePage,
  requestPage,
  requestUpdatePage,
} from "../controllers/page_controller";

const router: Router = express.Router();

router.get("/page/:id", requestPage);

router.get("/page", requestAllPages);

router.post("/page", requestCreatePage);

router.put("/page/:id", requestUpdatePage);

router.delete("/user/:id", requestDeletePage);

export default router;
