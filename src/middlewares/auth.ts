import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Usuario no válido o inactivo' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};
