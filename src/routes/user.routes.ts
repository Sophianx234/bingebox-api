import { Router } from 'express';
import multer from 'multer';
import { createUser, loginUser, uploadAvatar } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js'; // Adjust this path if your middleware is located elsewhere!

const router = Router();

// Configure Multer to use RAM (Required for Vercel deployments)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ==========================================
// PUBLIC ROUTES
// ==========================================
// When a POST request hits /api/users/register, fire the createUser controller
router.post('/register', createUser);
router.post('/signin', loginUser);

// ==========================================
// PROTECTED ROUTES (Requires Token)
// ==========================================
// upload.single('avatar') tells Multer to look for an image file sent with the key "avatar"
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;