import { Router } from 'express';
import { verifyToken } from '../middlewares/auth';
import { createGroup, getGroupById, getGroups, updateGroup } from '../controllers/group.controller';

const router = Router();

router.get('/', verifyToken, getGroups);
router.get('/:id', verifyToken, getGroupById);
router.post('/', verifyToken, createGroup);
router.patch('/:id', verifyToken, updateGroup);

export default router;
