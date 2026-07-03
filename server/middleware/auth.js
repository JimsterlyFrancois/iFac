import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant ou invalide' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const db = getDatabase();

    db.get(
      `SELECT id, email, faculty, option, level, is_admin, is_active
       FROM users WHERE id = ?`,
      [decoded.userId],
      (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Utilisateur introuvable' });
        }

        if (user.is_active === 0) {
          return res.status(403).json({ error: 'Compte désactivé' });
        }

        req.user = user;
        next();
      }
    );
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.is_admin !== 1) {
    return res.status(403).json({ error: 'Accès refusé (admin requis)' });
  }
  next();
};

export const authorizeOptionAccess = (allowedOptions = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (allowedOptions.length > 0 && !allowedOptions.includes(req.user.option)) {
      return res.status(403).json({ error: 'Accès non autorisé pour votre filière' });
    }

    next();
  };
};
