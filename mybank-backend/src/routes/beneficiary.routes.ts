import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getBeneficiaries, addBeneficiary, deleteBeneficiary } from '../controllers/beneficiary.controller';

const router = Router();

router.use(protect as never);

router.get('/', getBeneficiaries as never);
router.post('/', addBeneficiary as never);
router.delete('/:id', deleteBeneficiary as never);

export default router;
