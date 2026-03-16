import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util.js';
import { LoginInput, RegisterInput } from '../validations/user.schema.js';

export const registerUserInDB = async (userData: RegisterInput) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  return await prisma.user.create({
    data: {
      email: userData.email,
      username: userData.username,
      password: hashedPassword, // This will now be recognized!
      name: userData.name,
      birthdate: new Date(userData.birthdate),
      avatar: userData.avatar,
      bio: userData.bio,
    },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      avatar: true,
      bio: true,
    }
  });
};



export const loginUserInDB = async (data: LoginInput) => {
  const { email, password } = data;

  // 1. Find the user
  const user = await prisma.user.findUnique({ where: { email } });

  // 2. Check existence and password
  if (!user || !(await bcrypt.compare(password, user.password))) {
    const error = new Error('Invalid email or password');
    (error as any).statusCode = 401;
    throw error;
  }

  const sanitizedUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    avatar: user.avatar,
    bio: user.bio,
  };

  // 3. Generate BOTH tokens
  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  
  // NOTE: Make sure you have a generateRefreshToken function in the same 
  // file where generateAccessToken lives!
  const refreshToken = generateRefreshToken({ userId: user.id });


  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: refreshToken } // <-- This updates the null column!
  });

  // 4. Return the exact payload the React Native app needs
  return {
    user: sanitizedUser,
    accessToken,   // <-- Changed from 'token'
    refreshToken   // <-- Added
  };
};


export const refreshUserTokenInDB = async (clientRefreshToken: string) => {
  if (!clientRefreshToken) {
    const error = new Error('Refresh token is required');
    (error as any).statusCode = 401;
    throw error;
  }

  try {
    // 1. Verify the signature and expiration (This is your real security check!)
    const decoded = jwt.verify(
      clientRefreshToken, 
      process.env.REFRESH_SECRET!
    ) as { userId: number };

    // 2. Ensure the user still exists in your system
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.userId } 
    });

    if (!user) {
      const error = new Error('User no longer exists');
      (error as any).statusCode = 403;
      throw error;
    }

    // 3. THE SLIDING WINDOW: Generate a brand new pair of tokens
    const newAccessToken = generateAccessToken({ userId: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    // 4. Return the fresh tokens directly to the controller
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };

  } catch (err: any) {
    // If the error is our custom 403 from above, re-throw it
    if (err.statusCode) throw err;

    // Otherwise, jwt.verify failed (token is genuinely expired or tampered with)
    console.error("JWT Verification Failed:", err.message);
    const error = new Error('Refresh token expired or invalid. Please log in again.');
    (error as any).statusCode = 403;
    throw error;
  }
};




export const generatePasswordResetToken = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  
  // Security Tip: Even if user doesn't exist, don't tell the caller.
  if (!user) return null;

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  await prisma.user.update({
    where: { email },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour from now
    },
  });

  return resetToken; // Send the UNHASHED version to the user's email
};


// Update User Avatar
export const updateUserAvatarInDB = async (userId: number, avatarUrl: string) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
    // We select specific fields so we don't accidentally send the password back!
    select: { 
      id: true, 
      name: true, 
      email: true, 
      username: true, 
      avatar: true 
    } 
  });
};