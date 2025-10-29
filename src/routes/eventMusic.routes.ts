import { Router } from 'express';
import {
  completeEventMusic,
  getEventMusicBySession,
  initiateMusicRequest,
} from '../controllers/eventMusic.controller';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.get('/', getEventMusicBySession);
router.post('/create-session', initiateMusicRequest);
router.post('/complete', verifyToken, completeEventMusic);

export default router;
