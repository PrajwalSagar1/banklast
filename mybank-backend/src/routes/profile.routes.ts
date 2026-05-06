import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getProfile, updateProfile } from '../controllers/profile.controller';

const router = Router();

router.use(protect as never);

router.get('/', getProfile as never);
router.put('/update', updateProfile as never);

export default router;
