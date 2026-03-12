// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 1. Extend the Express Request to include our decoded user payload
export interface AuthRequest extends Request {
  user?: any; 
}

// 2. Strongly type the Express middleware parameters
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  // 3. Verify the token
  jwt.verify(token, process.env.JWT_SECRET as string, (err, decodedUser) => {
    if (err) {
      res.status(403).json({ message: 'Invalid token' });
      return;
    }
    
    // Attach the decoded user payload to the request
    req.user = decodedUser; 
    next();
  });
};

export default authenticateToken;