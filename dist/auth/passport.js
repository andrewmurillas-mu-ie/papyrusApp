"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_github2_1 = require("passport-github2");
const user_model_js_1 = require("../models/user_model.js");
passport_1.default.use(new passport_github2_1.Strategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback",
}, async (_accessToken, _refreshToken, profile, done) => {
    var _a, _b, _c, _d;
    try {
        let user = await (0, user_model_js_1.getUserByGithubId)(profile.id);
        if (!user) {
            user = await (0, user_model_js_1.createUser)({
                fullName: profile.displayName || profile.username || "",
                email: ((_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) || "",
                githubId: profile.id,
                avatarUrl: ((_d = (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value) || "",
                role: 'user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }
        done(null, user);
    }
    catch (err) {
        done(err);
    }
}));
exports.default = passport_1.default;
