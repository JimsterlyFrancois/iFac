import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = async (req, res, next) => {
  if (!req.user?.is_admin) {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

export const checkRestriction = async (req, res, next) => {
  if (!User.canAccessDocuments(req.user.option)) {
    return res.status(403).json({ error: 'Access restricted for your option' });
  }
  next();
};
