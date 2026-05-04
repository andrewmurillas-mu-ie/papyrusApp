"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("../auth/passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
router.get("/github", passport_1.default.authenticate("github", { scope: ["user:email"], session: false }));
router.get("/github/callback", passport_1.default.authenticate("github", {
    session: false,
    failureRedirect: "/auth/failure",
}), (req, res) => {
    const user = req.user;
    const payload = {
        _id: user._id,
        fullName: user.fullName,
        githubId: user.githubId,
        avatarUrl: user.avatarUrl,
        role: user.role,
        email: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    res.redirect(`http://localhost:5174/github/callback?token=${encodeURIComponent(token)}`);
});
router.get("/failure", (_req, res) => {
    res.status(401).json({ error: "GitHub authentication failed" });
});
exports.default = router;
