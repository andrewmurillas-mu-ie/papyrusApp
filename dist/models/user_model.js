"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = getUser;
exports.getAllUsers = getAllUsers;
exports.createUser = createUser;
exports.getUserByGithubId = getUserByGithubId;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const index_1 = require("../index");
const mongodb_1 = require("mongodb");
function isUser(doc) {
    if (!doc)
        return false;
    return ('name' in doc &&
        'email' in doc &&
        'avatarUrl' in doc &&
        'createdAt' in doc &&
        'updatedAt' in doc);
}
async function getUser(userId) {
    const users = (await index_1.db).collection('users');
    const query = { _id: new mongodb_1.ObjectId(userId) };
    const userDocument = await users.findOne(query);
    if (!isUser(userDocument))
        return null;
    return userDocument;
}
async function getAllUsers() {
    const users = (await index_1.db).collection('users');
    return users.find().toArray();
}
async function createUser(user) {
    const users = (await index_1.db).collection('users');
    await users.insertOne(user);
    return user;
}
async function getUserByGithubId(githubId) {
    const users = (await index_1.db).collection('users');
    return users.findOne({ githubId });
}
async function updateUser(userId, user) {
    const users = (await index_1.db).collection('users');
    await users.updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $set: user });
}
async function deleteUser(userId) {
    const users = (await index_1.db).collection('users');
    await users.deleteOne({ _id: new mongodb_1.ObjectId(userId) });
}
