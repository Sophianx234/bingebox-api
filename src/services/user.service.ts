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
    // Throw a custom error that the controller can catch
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

  // 3. Generate the token
  const token = generateAccessToken({ userId: user.id, email: user.email });

  // 4. Return data (Service handles the logic of what to return)
  
  return {
    user: sanitizedUser,
    token
  };
};


export const refreshUserTokenInDB = async (clientRefreshToken: string) => {
  if (!clientRefreshToken) {
    const error = new Error('Refresh token is required');
    (error as any).statusCode = 401;
    throw error;
  }

  try {
    // 1. Verify the signature and expiration of the Refresh Token
    const decoded = jwt.verify(
      clientRefreshToken, 
      process.env.REFRESH_SECRET!
    ) as { userId: string };

    // 2. Find the user in the database
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.userId } 
    });

    // 3. SECURITY CHECK: Does the token match what is in the database?
    // If it doesn't match, or the user is deleted, reject it immediately.
    if (!user || user.refreshToken !== clientRefreshToken) {
      const error = new Error('Invalid or revoked refresh token');
      (error as any).statusCode = 403; // 403 Forbidden is standard here
      throw error;
    }

    // 4. THE SLIDING WINDOW: Generate a brand new pair of tokens
    const newAccessToken = generateAccessToken({ userId: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    // 5. Save the new Refresh Token to the database, overwriting the old one
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken }
    });

    // 6. Return the fresh tokens
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };

  } catch (err) {
    // If jwt.verify fails (e.g., token is expired or tampered with), it throws an error here
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