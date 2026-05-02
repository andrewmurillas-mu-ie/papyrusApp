import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import User, { createUser, getUserByGithubId } from "../models/user_model.js";

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: "http://localhost:3000/auth/github/callback",
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: Function,
    ): Promise<void> => {
      try {
        let user: User | null = await getUserByGithubId(profile.id);
        if (!user) {
          user = await createUser({
            fullName: profile.displayName || profile.username || "",
            githubId: profile.id,
            avatarUrl: profile.photos?.[0]?.value || "",
            role: "user",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        done(null, user);
      } catch (err) {
        done(err);
      }
    },
  ),
);

        done(null, user);
      } catch (err) {
        done(err);
      }
    },
  ),
);

export default passport;