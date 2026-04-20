"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = connect;
require("dotenv/config");
const mongodb_1 = require("mongodb");
const uri = process.env.MONGO_URI;
const client = new mongodb_1.MongoClient(uri);
async function connect() {
    await client.connect();
    return client;
}
