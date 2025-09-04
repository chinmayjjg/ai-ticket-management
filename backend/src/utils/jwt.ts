import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';
import { Types } from 'mongoose';

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export const generateToken = (user: IUser): string => {
  const payload: JWTPayload = {
    id: (user._id as Types.ObjectId).toString(),
    email: user.email,
    role: user.role
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as JWTPayload;
};