import { Router } from 'express';
import {
  changeToPaidEventMusic,
  completeEventMusic,
  getEventMusicBySession,
  initiateMusicRequest,
} from '../controllers/eventMusic.controller';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.get('/', getEventMusicBySession);
router.post('/create-session', initiateMusicRequest);
router.post('/complete', verifyToken, completeEventMusic);
router.post('/paid', verifyToken, changeToPaidEventMusic);

export default router;
