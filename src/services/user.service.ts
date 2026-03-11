import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import { RegisterInput } from '../validations/user.schema.js';

export const createUserInDB = async (userData: RegisterInput) => {
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
  });
};