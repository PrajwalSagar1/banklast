import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getTransactions,
  getDeposits,
  getWithdrawals,
  getTransfers,
  getBalanceOverview,
} from '../controllers/transaction.controller';

const router = Router();

router.use(protect as never);

router.get('/', getTransactions as never);
router.get('/deposits', getDeposits as never);
router.get('/withdrawals', getWithdrawals as never);
router.get('/transfers', getTransfers as never);
router.get('/balance-overview', getBalanceOverview as never);

export default router;
