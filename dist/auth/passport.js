"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_github2_1 = require("passport-github2");
const user_model_js_1 = require("../models/user_model.js");
// Helper to fetch primary email when GitHub doesn't put it in profile.emails
async function fetchPrimaryEmail(accessToken) {
    try {
        const response = await fetch('https://api.github.com/user/emails', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github+json',
                'User-Agent': 'papyrus-app',
            },
        });
        if (!response.ok) {
            return '';
        }
        const emails = (await response.json());
        const primary = emails.find((e) => e.primary && e.verified) ||
            emails.find((e) => e.verified) ||
            emails[0];
        return (primary === null || primary === void 0 ? void 0 : primary.email) || '';
    }
    catch (_a) {
        return '';
    }
}
passport_1.default.use(new passport_github2_1.Strategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback",
}, async (_accessToken, _refreshToken, profile, done) => {
    var _a, _b;
    try {
        let user = await (0, user_model_js_1.getUserByGithubId)(profile.id);
        const emailFromProfile = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
        const email = emailFromProfile || (await fetchPrimaryEmail(accessToken)) || '';
        if (!user) {
            user = await (0, user_model_js_1.createUser)({
                fullName: profile.displayName || profile.username || "",
                githubId: profile.id,
                avatarUrl: ((_b = (_a = profile.photos) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) || "",
                role: "user",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
        else if (!user.email && email) {
            await (0, user_model_js_1.updateUser)((_f = (_e = user._id) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : '', {
                email,
                updatedAt: new Date().toISOString(),
            });
            user.email = email;
            user.updatedAt = new Date().toISOString();
        }
        done(null, user);
    }
    catch (err) {
        done(err);
    }
}));
exports.default = passport_1.default;
