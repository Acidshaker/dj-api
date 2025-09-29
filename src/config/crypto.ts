import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, stored: string): boolean => {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  if (!salt || !hash) return false;
  const hashedBuffer = Buffer.from(
    scryptSync(password, salt, 64).toString("hex"),
    "hex"
  );
  const storedBuffer = Buffer.from(hash, "hex");
  return timingSafeEqual(hashedBuffer, storedBuffer);
};
