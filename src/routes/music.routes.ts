import { Router } from 'express';
import { searchMusic } from '../controllers/music.controller';

const router = Router();

router.get('/', searchMusic);

export default router;
