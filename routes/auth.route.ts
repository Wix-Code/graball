import { deleteUser, getAllUsers, getUserProfile, loginUser, registerUser, updateUserProfile } from '@/controllers/auth.controller.js';
import { authenticateToken, requireAdmin } from '@/middlewares/auth.middleware';
import express from 'express';
//import { registerUser, loginUser } from '../controllers/auth.controller.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', loginUser);
router.get('/users', getAllUsers);
router.get('/user_profile', authenticateToken, getUserProfile);
router.post('/update', authenticateToken, updateUserProfile);
router.post('/delete', authenticateToken, requireAdmin, deleteUser);

export default router;
