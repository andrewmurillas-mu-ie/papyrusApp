import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid token' });
        return;
    }
    try {
        req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET!);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
