import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// 1. Initialize the official Postgres adapter with your Neon URL
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

// 2. Pass the adapter into the Prisma Client
export const prisma = new PrismaClient({ adapter });