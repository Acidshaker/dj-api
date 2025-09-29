import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { generateToken } from "../services/auth";
import { User } from "../models/User";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashed });
  res.status(201).json({ user });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }
  const token = generateToken({ id: user.id, email: user.email });
  res.json({ token });
};
