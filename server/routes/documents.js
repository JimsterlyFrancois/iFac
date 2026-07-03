import express from 'express';
import multer from 'multer';
import path from 'path';
import { Document } from '../models/Document.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// =========================
// MULTER CONFIG SAFE
// =========================
const upload = multer({
  dest: process.env.UPLOAD_DIR || './uploads',
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800')
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Format de fichier non autorisé'), false);
    }

    cb(null, true);
  },
});

// =========================
// GET USER DOCUMENTS
// =========================
router.get('/', authenticate, async (req, res) => {
  try {
    let { limit = 20, offset = 0 } = req.query;

    limit = Math.min(Math.max(parseInt(limit), 1), 50);
    offset = Math.max(parseInt(offset), 0);

    const documents = await Document.findForUser(req.user, limit, offset);
    const total = await Document.countForUser(req.user);

    return res.json({
      data: documents,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Erreur serveur lors de la récupération des documents'
    });
  }
});

// =========================
// GET DOCUMENT BY ID (SECURED)
// =========================
router.get('/:id', authenticate, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document introuvable' });
    }

    // contrôle d’accès minimal
    if (
      document.target_faculty !== req.user.faculty &&
      document.target_level !== 'ALL'
    ) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    return res.json(document);

  } catch (error) {
    return res.status(500).json({
      error: 'Erreur serveur'
    });
  }
});

// =========================
// CREATE DOCUMENT (ADMIN ONLY)
// =========================
router.post(
  '/',
  authenticate,
  authorizeAdmin,
  upload.single('file'),
  async (req, res) => {
    try {
      const {
        title,
        description,
        target_faculty,
        target_option,
        target_level,
        category
      } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'Fichier requis' });
      }

      if (!title || !target_faculty || !target_option || !target_level || !category) {
        return res.status(400).json({ error: 'Champs obligatoires manquants' });
      }

      const document = await Document.create({
        title,
        description,
        file_url: `/uploads/${req.file.filename}`,
        file_name: req.file.originalname,
        file_size: req.file.size,
        file_type: req.file.mimetype,
        target_faculty,
        target_option,
        target_level,
        category,
        uploaded_by: req.user.id,
      });

      return res.status(201).json(document);

    } catch (error) {
      return res.status(500).json({
        error: 'Erreur lors de la création du document'
      });
    }
  }
);

// =========================
// DELETE DOCUMENT (ADMIN ONLY)
// =========================
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    await Document.delete(req.params.id);
    return res.json({ message: 'Document supprimé' });

  } catch (error) {
    return res.status(500).json({
      error: 'Erreur suppression document'
    });
  }
});

// =========================
// TRACK DOWNLOAD
// =========================
router.post('/:id/download', authenticate, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document introuvable' });
    }

    await Document.trackDownload(req.user.id, req.params.id);

    return res.json({
      message: 'Téléchargement enregistré',
      file_url: document.file_url
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Erreur tracking téléchargement'
    });
  }
});

export default router;
