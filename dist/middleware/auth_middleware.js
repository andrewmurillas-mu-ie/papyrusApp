"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!(header === null || header === void 0 ? void 0 : header.startsWith('Bearer '))) {
        res.status(401).json({ error: 'Missing or invalid token' });
        return;
    }
    try {
        req.user = jsonwebtoken_1.default.verify(header.slice(7), process.env.JWT_SECRET);
        next();
    }
    catch (_a) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
