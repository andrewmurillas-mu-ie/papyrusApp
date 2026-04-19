import {requestAllUsers, requestUser} from "../controllers/user_controller";
import express, {Router} from "express";

const router: Router = express.Router();

router.get('/user/:id', requestUser);

router.get('/user', requestAllUsers);

export default router;
