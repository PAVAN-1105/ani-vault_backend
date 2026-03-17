// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any; 
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // 🚨 1. The Preflight Bypass (Crucial for Vercel -> Render communication)
  // Let the invisible browser check pass through without a token
  if (req.method === 'OPTIONS') {
    next();
    return;
  }

  // 2. Safely grab the header 
  const authHeader = req.headers.authorization || req.headers['authorization'];
  
  // 🕵️ DEBUG LOG: This will print in your Render logs so we can see the absolute truth!
  console.log(`[Auth] Method: ${req.method} | Header: ${authHeader ? 'Exists' : 'MISSING'}`);

  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decodedUser) => {
    if (err) {
      res.status(403).json({ message: 'Invalid token' });
      return;
    }
    
    req.user = decodedUser; 
    next();
  });
};

export default authenticateToken;