import express, { Router, Request, Response } from 'express';
import passport from '../auth/passport.js';
import jwt from 'jsonwebtoken';
import User from '../models/user_model.js';

const router: Router = express.Router();

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));

router.get('/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/auth/failure' }),
    (req: Request, res: Response) => {
        const token = jwt.sign(req.user as User, process.env.JWT_SECRET!, { expiresIn: '7d' });
        res.json({ token });
    }
);

router.get('/failure', (_req: Request, res: Response) => {
    res.status(401).json({ error: 'GitHub authentication failed' });
});

export default router;
