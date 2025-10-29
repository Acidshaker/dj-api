import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  username: string;
  email: string;
  role: string;
  subscription_status: string;
  stripeAccountId: string | null;
  first_name: string;
  last_name: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '8h',
  });
};
