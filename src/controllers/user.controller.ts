import { Request, Response } from 'express';
import { z } from 'zod';
import { generatePasswordResetToken, loginUserInDB, registerUserInDB } from '../services/user.service.js';
import { generateToken } from '../utils/jwt.util.js';
import { loginSchema, registerSchema } from '../validations/user.schema.js';
import { sendEmail } from '../utils/mail.util.js';


export const createUser = async (req: Request, res: Response) => {
  try {
    // 1. Validate the body (Zod handles birthdate strings, emails, etc.)
    const validatedData = registerSchema.parse(req.body);

    // 2. Pass the WHOLE object to the service
    const newUser = await registerUserInDB(validatedData);

    // 3. Security: Strip the password before sending the user back to the app
    const token = generateToken({ 
  userId: newUser.id, 
  email: newUser.email 
});

// 3. Strip password and send response

return res.status(201).json({
  message: 'User created successfully!',
  user: newUser,
  token
});

   

  } catch (error: any) {
    if (error instanceof z.ZodError) {
  return res.status(400).json({ 
    error: "Validation failed", 
    // Change 'error.errors' to 'error.issues'
    details: error.issues.map(e => ({ 
      path: e.path[0], 
      message: e.message 
    })) 
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




export const loginUser = async (req: Request, res: Response) => {
  try {
    // 1. Validate Input
    const validatedData = loginSchema.parse(req.body);

    // 2. Call Service
    const result = await loginUserInDB(validatedData);

    // 3. Success Response
    return res.status(200).json({
      message: "Login successful",
      ...result
    });

  } catch (error: any) {
    // Handle Zod Validation Errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.issues.map(e => ({ path: e.path[0], message: e.message })) 
      });
    }

    // Handle the "Invalid credentials" error from the service
    if (error.statusCode === 401) {
      return res.status(401).json({ error: error.message });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const resetToken = await generatePasswordResetToken(email);

    if (resetToken) {
      // In production, this would be your frontend URL
      const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

      await sendEmail({
        to: email,
        subject: 'Reset your Binge Box Password',
        html: `
          <h1>Password Reset Request</h1>
          <p>You requested a password reset for your Binge Box account.</p>
          <p>Click the link below to set a new password. This link expires in 1 hour.</p>
          <a href="${resetLink}" style="padding: 10px 20px; background-color: #e50914; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `
      });
    }

    // Always return 200 to prevent email probing
    return res.status(200).json({ 
      message: "If an account exists, a reset link has been sent." 
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};