"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_js_1 = __importDefault(require("../auth/passport.js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
router.get('/github', passport_js_1.default.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', passport_js_1.default.authenticate('github', { session: false, failureRedirect: '/auth/failure' }), (req, res) => {
    const token = jsonwebtoken_1.default.sign(req.user, process.env.JWT_SECRET, { expiresIn: '7d' });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    res.redirect(`${frontendUrl}/github/callback?token=${encodeURIComponent(token)}`);
});
router.get('/failure', (_req, res) => {
    res.status(401).json({ error: 'GitHub authentication failed' });
});
exports.default = router;
