import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
  birthdate: z.string().datetime(), // Ensures it's an ISO string
  avatar: z.string().url().optional(),
  bio: z.string().max(160).optional(),
});

// This magic line creates a TypeScript type automatically!
export type RegisterInput = z.infer<typeof registerSchema>;