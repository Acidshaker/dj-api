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
router.post('/reactive', verifyToken, reactiveEventPackage);
router.patch('/:id', verifyToken, updateEventPackage);
router.delete('/:id', verifyToken, softDeleteEventPackage);

export default router;
