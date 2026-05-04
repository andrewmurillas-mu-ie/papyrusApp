import passport from "passport";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import { createUser, getUserByGithubId } from "../models/user_model";
import User from "../models/user_model";

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: "http://localhost:3000/auth/github/callback",
    },
    async (
      accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: Function,
    ): Promise<void> => {
      try {
        let email = profile.emails?.[0]?.value || null;

        if (!email) {
          const response = await axios.get("https://api.github.com/user/emails", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
              "User-Agent": "papyrus-app",
            },
          });

          const emails = response.data as Array<{
            email: string;
            primary: boolean;
            verified: boolean;
            visibility: string | null;
          }>;

          const primaryVerified = emails.find((item) => item.primary && item.verified);
          const verified = emails.find((item) => item.verified);
          const fallback = emails[0];

          email = primaryVerified?.email || verified?.email || fallback?.email || null;
        }

        let user = await getUserByGithubId(profile.id);

        if (!user) {
          user = await createUser({
            fullName: profile.displayName || profile.username || "",
            githubId: profile.id,
            email,
            avatarUrl: profile.photos?.[0]?.value || "",
            role: "user",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          let changed = false;

          if (email && user.email !== email) {
            user.email = email;
            changed = true;
          }

          const fullName = profile.displayName || profile.username || user.fullName;
          const avatarUrl = profile.photos?.[0]?.value || user.avatarUrl;

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
            await (user as any).save();
          }
        }

        done(null, user);
      } catch (err) {
        done(err);
      }
    },
  ),
);

export default passport;