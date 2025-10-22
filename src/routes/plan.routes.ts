import { Router } from 'express';
import { verifyToken } from '../middlewares/auth';
import { getPlans } from '../controllers/plan.controller';

const router = Router();

router.get('/', verifyToken, getPlans);

export default router;
