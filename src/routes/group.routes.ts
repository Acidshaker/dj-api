import { Router } from 'express';
import { verifyToken } from '../middlewares/auth';
import {
  createGroup,
  getGroupById,
  getGroups,
  reactivateGroup,
  softDeleteGroup,
  updateGroup,
} from '../controllers/group.controller';

const router = Router();

router.get('/', verifyToken, getGroups);
router.get('/:id', verifyToken, getGroupById);
router.post('/', verifyToken, createGroup);
router.patch('/:id', verifyToken, updateGroup);
router.post('/:id/desactive', verifyToken, softDeleteGroup);
router.post('/:id/reactive', verifyToken, reactivateGroup);

export default router;
