import express from 'express';

const router = express.Router();

import { authenticateToken } from '@/middlewares/auth.middleware.js';
import { sendMessage } from '@/controllers/message.controller';

router.post('/', sendMessage);

export default router;