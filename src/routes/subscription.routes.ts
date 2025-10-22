import { Router } from 'express';
import { verifyToken } from '../middlewares/auth';
import {
  getMySubscription,
  cancelSubscription,
  subscribe,
  startSubscriptionPayment,
  verifyStripeSession,
} from '../controllers/subscription.controller';

const router = Router();

router.get('/', verifyToken, getMySubscription);
router.get('/verify-session', verifyToken, verifyStripeSession);
router.post('/checkout-session', verifyToken, startSubscriptionPayment);
router.post('/subscribe', verifyToken, subscribe);
router.post('/cancel', verifyToken, cancelSubscription);

export default router;
