import { getDatabase } from '../config/database.js';
import path from 'path';

export class Document {

  // =========================
  // CREATE DOCUMENT
  // =========================
  static async create(documentData) {
    const db = getDatabase();

    const {
      title,
      description,
      file_url,
      file_name,
      file_size,
      file_type,
      target_faculty,
      target_option,
      target_level,
      category,
      uploaded_by,
    } = documentData;

    // Validation basique serveur
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const fileExtension = path.extname(file_name).toLowerCase();
    const allowedExtensions = ['.pdf', '.doc', '.docx'];

    if (
      !allowedTypes.includes(file_type) ||
      !allowedExtensions.includes(fileExtension)
    ) {
      throw new Error('Format de fichier non autorisé');
    }

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO documents 
        (title, description, file_url, file_name, file_size, file_type,
         target_faculty, target_option, target_level, category, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(
        query,
        [
          title,
          description,
          file_url,
          file_name,
          file_size,
          file_type,
          target_faculty,
          target_option,
          target_level,
          category,
          uploaded_by,
        ],
        function (err) {
          if (err) return reject(err);

          resolve({
            id: this.lastID,
            ...documentData,
          });
        }
      );
    });
  }

  // =========================
  // FIND BY ID
  // =========================
  static async findById(id) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM documents WHERE id = ? AND is_active = 1',
        [id],
        (err, row) => {
          if (err) return reject(err);
          resolve(row || null);
        }
      );
    });
  }

  // =========================
  // USER DOCUMENT FEED
  // =========================
  static async findForUser(user, limit = 20, offset = 0) {
    const db = getDatabase();

    // sécurité pagination
    limit = Math.min(Math.max(limit, 1), 50);
    offset = Math.max(offset, 0);

    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM documents
        WHERE is_active = 1
          AND target_faculty = ?
          AND target_option = ?
          AND (target_level = ? OR target_level = 'ALL')
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;

      db.all(
        query,
        [user.faculty, user.option, user.level, limit, offset],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });
  }

  // =========================
  // COUNT USER DOCUMENTS
  // =========================
  static async countForUser(user) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as total FROM documents
        WHERE is_active = 1
          AND target_faculty = ?
          AND target_option = ?
          AND (target_level = ? OR target_level = 'ALL')
      `;

      db.get(
        query,
        [user.faculty, user.option, user.level],
        (err, row) => {
          if (err) return reject(err);
          resolve(row?.total || 0);
        }
      );
    });
  }

  // =========================
  // ADMIN VIEW ALL
  // =========================
  static async findAll(limit = 20, offset = 0) {
    const db = getDatabase();

    limit = Math.min(Math.max(limit, 1), 50);
    offset = Math.max(offset, 0);

    return new Promise((resolve, reject) => {
      db.all(
        `
        SELECT * FROM documents
        WHERE is_active = 1
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        `,
        [limit, offset],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });
  }

  // =========================
  // SOFT DELETE
  // =========================
  static async delete(id) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE documents SET is_active = 0 WHERE id = ?',
        [id],
        function (err) {
          if (err) return reject(err);
          resolve(true);
        }
      );
    });
  }

  // =========================
  // TRACK DOWNLOAD
  // =========================
  static async trackDownload(userId, documentId) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO document_downloads (user_id, document_id)
         VALUES (?, ?)`,
        [userId, documentId],
        function (err) {
          if (err) return reject(err);
          resolve(true);
        }
      );
    });
  }
}
