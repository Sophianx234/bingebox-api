import { Router } from 'express';
import { createUser } from '../controllers/user.controller.js';

const router = Router();

// When a POST request hits /api/users, fire the createUser controller
router.post('/', createUser);

export default router;