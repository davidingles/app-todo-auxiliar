import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}