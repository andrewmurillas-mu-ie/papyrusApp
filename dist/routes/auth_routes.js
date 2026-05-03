"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_js_1 = __importDefault(require("../auth/passport.js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
router.get("/github", passport_js_1.default.authenticate("github", { scope: ["user:email"], session: false }));
router.get("/github/callback", passport_js_1.default.authenticate("github", {
    session: false,
    failureRedirect: "/auth/failure",
}), (req, res) => {
    const user = req.user;
    const payload = {
        id: user._id,
        fullName: user.fullName,
        githubId: user.githubId,
        avatarUrl: user.avatarUrl,
        role: user.role,
    };
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    res.json({ token });
});
router.get("/failure", (_req, res) => {
    res.status(401).json({ error: "GitHub authentication failed" });
});
exports.default = router;
