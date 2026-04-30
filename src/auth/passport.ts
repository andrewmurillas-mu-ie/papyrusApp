import passport from 'passport';
import { Strategy as GitHubStrategy, Profile } from 'passport-github2';
import { createUser, getUserByGithubId, updateUser, User } from '../models/user_model.js';

// Helper to fetch primary email when GitHub doesn't put it in profile.emails
async function fetchPrimaryEmail(accessToken: string): Promise<string | ''> {
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

    const emails = (await response.json()) as Array<{
      email: string;
      primary: boolean;
      verified: boolean;
      visibility: string | null;
    }>;

    const primary =
      emails.find((e) => e.primary && e.verified) ||
      emails.find((e) => e.verified) ||
      emails[0];

    return primary?.email || '';
  } catch {
    return '';
  }
}

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: 'http://localhost:3000/auth/github/callback',
    },
    async (
      accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: Function,
    ): Promise<void> => {
      try {
        let user: User | null = await getUserByGithubId(profile.id);

        const emailFromProfile = profile.emails?.[0]?.value;
        const email =
          emailFromProfile || (await fetchPrimaryEmail(accessToken)) || '';

        if (!user) {
          user = await createUser({
            name: profile.displayName || profile.username || '',
            email,
            githubId: profile.id,
            avatarUrl: profile.photos?.[0]?.value || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else if (!user.email && email) {
          await updateUser((user as any)._id?.toString() ?? '', {
            email,
            updatedAt: new Date().toISOString(),
          });
          user.email = email;
          user.updatedAt = new Date().toISOString();
        }

        done(null, user);
      } catch (err) {
        done(err);
      }
    },
  ),
);

export default passport;