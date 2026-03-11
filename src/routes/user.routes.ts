import { Router } from 'express';
import { createUser, loginUser } from '../controllers/user.controller.js';

const router = Router();

// When a POST request hits /api/users, fire the createUser controller
router.post('/register', createUser);
router.post('/signin', loginUser);

export default router;