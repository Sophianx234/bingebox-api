import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Initialize the OpenAPI extension
extendZodWithOpenApi(z);

export const registerSchema = z.object({
  email: z.string().email("Invalid email format").openapi({ 
    example: 'user@example.com',
    description: 'A valid email address for account notifications'
  }),
  username: z.string().min(3, "Username must be at least 3 characters").openapi({
    example: 'coder123'
  }),
  password: z.string().min(8, "Password must be at least 8 characters").openapi({
    example: 'P@ssword123!',
    description: 'Must contain at least 8 characters'
  }),
  name: z.string().min(1, "Name is required").openapi({
    example: 'John Doe'
  }),
  birthdate: z.string().datetime().openapi({
    example: '1995-05-15T00:00:00Z',
    description: 'ISO 8601 formatted date string'
  }),
  avatar: z.string().url().optional().openapi({
    example: 'https://example.com/avatar.jpg'
  }),
  bio: z.string().max(160).optional().openapi({
    example: 'Software engineer and coffee lover.'
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;



export const loginSchema = z.object({
  email: z.string().email("Invalid email format").openapi({ example: 'john@example.com' }),
  password: z.string().min(1, "Password is required").openapi({ example: 'P@ssword123!' }),
});

export const userResponseSchema = registerSchema.omit({ 
  password: true 
}).openapi('UserResponse');
export type LoginInput = z.infer<typeof loginSchema>;