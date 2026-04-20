import {requestAllUsers, requestCreateUser, requestDeleteUser, requestUpdateUser, requestUser} from "../controllers/user_controller";
import express, {Router} from "express";

const router: Router = express.Router();

router.get('/user/:id', requestUser);

router.get('/user', requestAllUsers);

router.post('/user', requestCreateUser);

router.put('/user/:id', requestUpdateUser);

router.delete('/user/:id', requestDeleteUser);

export default router;
