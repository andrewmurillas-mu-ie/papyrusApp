"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const passport_github2_1 = require("passport-github2");
const user_model_1 = require("../models/user_model");
passport_1.default.use(new passport_github2_1.Strategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback",
}, async (accessToken, _refreshToken, profile, done) => {
    var _a, _b, _c, _d, _e, _f;
    try {
        let email = ((_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) || null;
        if (!email) {
            const response = await axios_1.default.get("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28",
                    "User-Agent": "papyrus-app",
                },
            });
            const emails = response.data;
            const primaryVerified = emails.find((item) => item.primary && item.verified);
            const verified = emails.find((item) => item.verified);
            const fallback = emails[0];
            email = (primaryVerified === null || primaryVerified === void 0 ? void 0 : primaryVerified.email) || (verified === null || verified === void 0 ? void 0 : verified.email) || (fallback === null || fallback === void 0 ? void 0 : fallback.email) || null;
        }
        let user = await (0, user_model_1.getUserByGithubId)(profile.id);
        if (!user) {
            user = await (0, user_model_1.createUser)({
                fullName: profile.displayName || profile.username || "",
                githubId: profile.id,
                email,
                avatarUrl: ((_d = (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value) || "",
                role: "user",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
        else {
            let changed = false;
            if (email && user.email !== email) {
                user.email = email;
                changed = true;
            }
            const fullName = profile.displayName || profile.username || user.fullName;
            const avatarUrl = ((_f = (_e = profile.photos) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.value) || user.avatarUrl;
            if (user.fullName !== fullName) {
                user.fullName = fullName;
                changed = true;
            }
            if (user.avatarUrl !== avatarUrl) {
                user.avatarUrl = avatarUrl;
                changed = true;
            }
            if (changed) {
                user.updatedAt = new Date();
                await user.save();
            }
        }
        done(null, user);
    }
    catch (err) {
        done(err);
    }
}));
exports.default = passport_1.default;
