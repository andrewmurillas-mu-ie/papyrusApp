import {requestUser} from "../controllers/user_controller";
import express, {Router} from "express";

const router: Router = express.Router();

router.get('/user', requestUser);

export default router;
