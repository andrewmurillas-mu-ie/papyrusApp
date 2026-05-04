import express, { Router, Request, Response } from "express";
import passport from "../auth/passport";
import jwt from "jsonwebtoken";
import User from "../models/user_model";

const router: Router = express.Router();

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"], session: false }),
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/auth/failure",
  }),
  (req: Request, res: Response): void => {
    const user = req.user as User & { _id: string };
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
    const token: string = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
    res.redirect(`http://localhost:5174/github/callback?token=${encodeURIComponent(token)}`);
  },
);

router.get("/failure", (_req: Request, res: Response): void => {
  res.status(401).json({ error: "GitHub authentication failed" });
});

export default router;
