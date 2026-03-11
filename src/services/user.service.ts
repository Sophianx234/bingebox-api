import crypto from 'crypto';
import { generateToken } from '../utils/jwt.util.js';
import { LoginInput } from '../validations/user.schema.js';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import { RegisterInput } from '../validations/user.schema.js';

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
  const token = generateToken({ userId: user.id, email: user.email });

  // 4. Return data (Service handles the logic of what to return)
  
  return {
    user: sanitizedUser,
    token
  };
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