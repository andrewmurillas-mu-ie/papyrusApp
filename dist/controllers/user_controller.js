"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestUser = requestUser;
exports.requestAllUsers = requestAllUsers;
exports.requestCreateUser = requestCreateUser;
exports.requestUpdateUser = requestUpdateUser;
exports.requestDeleteUser = requestDeleteUser;
const user_model_1 = require("../models/user_model");
async function requestUser(req, res) {
    const user = await (0, user_model_1.getUser)(req.params.id);
    res.json(user);
}
async function requestAllUsers(_, res) {
    const users = await (0, user_model_1.getAllUsers)();
    res.json(users);
}
async function requestCreateUser(req, res) {
    const user = req.body;
    await (0, user_model_1.createUser)(user);
    res.status(201).json(user);
}
async function requestUpdateUser(req, res) {
    const user = req.body;
    await (0, user_model_1.updateUser)(req.params.id, user);
    res.json(user);
}
async function requestDeleteUser(req, res) {
    await (0, user_model_1.deleteUser)(req.params.id);
    res.status(204).end();
}
//# sourceMappingURL=user_controller.js.map