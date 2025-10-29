import { Router } from 'express';
import { verifyToken } from '../middlewares/auth';
import {
  createEventPackage,
  getEventPackages,
  reactiveEventPackage,
  updateEventPackage,
  softDeleteEventPackage,
} from '../controllers/eventPackage.controller';

const router = Router();

router.get('/', verifyToken, getEventPackages);
router.post('/', verifyToken, createEventPackage);
router.post('/:id/reactive', verifyToken, reactiveEventPackage);
router.post('/:id/desactive', verifyToken, softDeleteEventPackage);
router.patch('/:id', verifyToken, updateEventPackage);

export default router;
