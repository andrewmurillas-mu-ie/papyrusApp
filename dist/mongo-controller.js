"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = connect;
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
async function connect() {
    return mongoose_1.default.connect(process.env.MONGO_URI);
}
