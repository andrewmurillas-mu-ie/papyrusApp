"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_1 = require("../controllers/user_controller");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/user/:id', user_controller_1.requestUser);
router.get('/user', user_controller_1.requestAllUsers);
router.post('/user', user_controller_1.requestCreateUser);
router.put('/user/:id', user_controller_1.requestUpdateUser);
router.delete('/user/:id', user_controller_1.requestDeleteUser);
exports.default = router;
