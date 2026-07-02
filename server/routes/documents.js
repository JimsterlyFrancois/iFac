import express from 'express';
import multer from 'multer';
import path from 'path';
import { Document } from '../models/Document.js';
import { authenticate, authorize, checkRestriction } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  dest: process.env.UPLOAD_DIR || './uploads',
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'));
    }
  },
});

// Get documents for authenticated user (Targeted Distribution)
router.get('/', authenticate, checkRestriction, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const documents = await Document.findForUser(req.user, parseInt(limit), parseInt(offset));
    const total = await Document.countForUser(req.user);

    res.json({
      data: documents,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get document details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create document (Admin only - jimsterlyfrancois@gmail.com)
router.post('/', authenticate, authorize, upload.single('file'), async (req, res) => {
  try {
    const { title, description, target_faculty, target_option, target_level, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!title || !target_faculty || !target_option || !target_level || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
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

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete document (Admin only - jimsterlyfrancois@gmail.com)
router.delete('/:id', authenticate, authorize, async (req, res) => {
  try {
    await Document.delete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track document download
router.post('/:id/download', authenticate, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    await Document.trackDownload(req.user.id, req.params.id);
    res.json({ message: 'Download tracked', file_url: document.file_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
