import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = express.Router();

// =========================
// LOGIN
// =========================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const isValidPassword = await User.verifyPassword(user, password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      is_admin: user.is_admin,
      faculty: user.faculty,
      option: user.option,
      level: user.level
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION || '7d'
      }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        faculty: user.faculty,
        option: user.option,
        level: user.level,
        is_admin: user.is_admin
      }
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Erreur serveur lors de la connexion'
    });
  }
});

// =========================
// REGISTER (MVP CONTROLLED)
// =========================
router.post('/register', async (req, res) => {
  try {
    const { email, password, faculty, option, level } = req.body;

    if (!email || !password || !faculty || !option || !level) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      return res.status(409).json({ error: 'Utilisateur déjà existant' });
    }

    // validation simple email universitaire (UPNCH)
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    const user = await User.create(email, password, faculty, option, level, false);

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        is_admin: false,
        faculty,
        option,
        level
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION || '7d'
      }
    );

    return res.status(201).json({
      token,
      user
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Erreur serveur lors de l’inscription'
    });
  }
});

export default router;
