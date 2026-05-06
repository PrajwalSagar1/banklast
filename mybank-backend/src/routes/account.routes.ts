import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getDashboard, deposit, withdraw, transfer } from '../controllers/account.controller';

const router = Router();

router.use(protect as never);

router.get('/dashboard', getDashboard as never);
router.post('/deposit', deposit as never);
router.post('/withdraw', withdraw as never);
router.post('/transfer', transfer as never);

export default router;
