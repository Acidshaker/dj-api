import type { Request, Response } from "express";
import { User } from "../models/User";
export const getProfile = async (req: Request, res: Response) => {
  const user = await User.findByPk(req.user.id);
  res.json({ user });
};
