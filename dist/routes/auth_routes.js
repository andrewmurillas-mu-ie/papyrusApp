"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_js_1 = __importDefault(require("../auth/passport.js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_js_1 = require("../models/user_model.js");
const router = express_1.default.Router();
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    console.log('[Register] Attempt for email:', email);
    if (!name || !email || !password) {
        res.status(400).json({ error: 'name, email, and password are required' });
        return;
    }
    try {
        const existing = await (0, user_model_js_1.getUserByEmail)(email);
        if (existing) {
            console.log('[Register] Email already in use:', email);
            res.status(409).json({ error: 'Email already in use' });
            return;
        }
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const now = new Date().toISOString();
        const newUser = { name, email, passwordHash, avatarUrl: '', createdAt: now, updatedAt: now };
        await (0, user_model_js_1.createUser)(newUser);
        console.log('[Register] User created successfully:', email);
        const token = jsonwebtoken_1.default.sign({ email, name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { name, email, avatarUrl: '' } });
    }
    catch (err) {
        console.error('[Register] Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('[Login] Attempt for email:', email);
    if (!email || !password) {
        res.status(400).json({ error: 'email and password are required' });
        return;
    }
    try {
        const user = await (0, user_model_js_1.getUserByEmail)(email);
        if (!user) {
            console.log('[Login] No user found for email:', email);
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        if (!user.passwordHash) {
            console.log('[Login] User exists but has no password hash (GitHub OAuth user?):', email);
            res.status(401).json({ error: 'This account uses GitHub login — no password is set' });
            return;
        }
        const match = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!match) {
            console.log('[Login] Password mismatch for:', email);
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        console.log('[Login] Success for:', email);
        const token = jsonwebtoken_1.default.sign({ email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { name: user.name, email: user.email, avatarUrl: user.avatarUrl } });
    }
    catch (err) {
        console.error('[Login] Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/github', passport_js_1.default.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', passport_js_1.default.authenticate('github', { session: false, failureRedirect: 'http://localhost:5173/login?error=github_failed' }), (req, res) => {
    const user = req.user;
    console.log('[GitHub OAuth] Login successful for:', user.email || user.name);
    const _a = user, { passwordHash: _omit } = _a, safeUser = __rest(_a, ["passwordHash"]);
    const token = jsonwebtoken_1.default.sign(safeUser, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
});
exports.default = router;
