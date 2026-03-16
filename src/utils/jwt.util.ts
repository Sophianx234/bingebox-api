import jwt from 'jsonwebtoken';

// Define an interface for the data you want to store in the token
interface TokenPayload {
  userId: number;
  email: string;
}



// 1. THE ACCESS TOKEN (Short-Lived: 15 Minutes)
export const generateAccessToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '15m', 
  });
};

// 2. THE REFRESH TOKEN (Long-Lived: 6 Months)
// Notice we usually only need the userId in the refresh payload
export const generateRefreshToken = (payload: {userId:number}): string => {
  const secret = process.env.REFRESH_SECRET;

  if (!secret) {
    throw new Error('REFRESH_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '180d', 
  });
};