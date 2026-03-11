import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// This extends the Express Request type to include the user object
export interface AuthRequest extends Request {
  user?: {
    userId: number;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  // 1. Check if the Authorization header exists and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extract the token from the "Bearer <token>" string
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };

      // 4. Attach the decoded userId to the request object for use in controllers
      req.user = { userId: decoded.userId };

      // 5. Move to the next middleware or controller
      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  // 6. If no token is found at all
  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }
};