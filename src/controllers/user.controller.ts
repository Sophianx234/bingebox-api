import { Request, Response } from 'express';
import { registerSchema } from '../validations/user.schema.js';
import { createUserInDB } from '../services/user.service.js';
import { z } from 'zod';

export const createUser = async (req: Request, res: Response): Promise<any> => {
  try {
    // 1. Validate the body (Zod handles birthdate strings, emails, etc.)
    const validatedData = registerSchema.parse(req.body);
    const { email, name, avatar } = validatedData; // Extract only the fields we need for DB

    // 2. Pass the WHOLE object to the service
    const newUser = await createUserInDB(email, name, avatar);

    // 3. Security: Strip the password before sending the user back to the app
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({ 
      message: 'User created successfully!', 
      user: userWithoutPassword 
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors.map(e => ({ path: e.path[0], message: e.message })) 
      });
    }
    
    // Check for Prisma "Unique Constraint" error (e.g., email already exists)
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email or Username already taken' });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};