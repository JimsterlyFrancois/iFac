import jwt from 'jsonwebtoken';  
import { query } from '../config/database.js';  
  
const toBool = (v) => v === true || v === 1;  
  
export const authenticate = async (req, res, next) => {  
  try {  
    const authHeader = req.headers.authorization;  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {  
      return res.status(401).json({ error: 'Token manquant ou invalide' });  
    }  
  
    const token = authHeader.split(' ')[1];  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  
  
    const { rows } = await query(  
      `SELECT id, email, faculty, option, level, is_admin, is_active  
       FROM users WHERE id = ?`,  
      [decoded.userId]  
    );  
    const user = rows[0];  
  
    if (!user) return res.status(401).json({ error: 'Utilisateur introuvable' });  
    if (!toBool(user.is_active)) return res.status(403).json({ error: 'Compte désactivé' });  
  
    req.user = { ...user, is_admin: toBool(user.is_admin), is_active: toBool(user.is_active) };  
    next();  
  } catch (error) {  
    return res.status(401).json({ error: 'Token invalide ou expiré' });  
  }  
};  
  
export const authorizeAdmin = (req, res, next) => {  
  if (!req.user || req.user.is_admin !== true) {  
    return res.status(403).json({ error: 'Accès refusé (admin requis)' });  
  }  
  next();  
};  
  
export const authorizeOptionAccess = (allowedOptions = []) => (req, res, next) => {  
  if (!req.user) return res.status(401).json({ error: 'Non authentifié' });  
  if (allowedOptions.length > 0 && !allowedOptions.includes(req.user.option)) {  
    return res.status(403).json({ error: 'Accès non autorisé pour votre filière' });  
  }  
  next();  
};