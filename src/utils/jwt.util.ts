import jwt from 'jsonwebtoken';

// Define an interface for the data you want to store in the token
interface TokenPayload {
  userId: number;
  email: string;
}

/**
 * Generates a JWT for a user
 * @param payload - The data to encode (userId, email)
 * @returns string - The signed token
 */
export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    // In production, you definitely want to throw an error if the secret is missing
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '24h',
  });
};