import { deleteUser, getAllUsers, getUserProfile, loginUser, registerUser, updateUserProfile } from '../controllers/auth.controller.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';
import express from 'express';
const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', loginUser);
router.get('/users', getAllUsers);
router.get('/user_profile', authenticateToken, getUserProfile);
router.post('/update', authenticateToken, updateUserProfile);
router.post('/delete', authenticateToken, requireAdmin, deleteUser);
export default router;
//# sourceMappingURL=auth.route.js.map