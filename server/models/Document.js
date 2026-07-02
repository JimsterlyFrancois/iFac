import { getDatabase } from '../config/database.js';

export class Document {
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

    // Vérifier que le fichier est PDF ou Word
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file_type)) {
      throw new Error('Only PDF and Word documents are allowed');
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
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...documentData });
        }
      );
    });
  }

  static async findById(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM documents WHERE id = ? AND is_active = 1';
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  // CORE BUSINESS LOGIC: Targeted Distribution
  static async findForUser(user, limit = 20, offset = 0) {
    const db = getDatabase();
    const { faculty, option, level } = user;

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
      db.all(query, [faculty, option, level, limit, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  static async countForUser(user) {
    const db = getDatabase();
    const { faculty, option, level } = user;

    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as total FROM documents 
        WHERE is_active = 1
          AND target_faculty = ?
          AND target_option = ?
          AND (target_level = ? OR target_level = 'ALL')
      `;
      db.get(query, [faculty, option, level], (err, row) => {
        if (err) reject(err);
        else resolve(row?.total || 0);
      });
    });
  }

  static async findAll(limit = 20, offset = 0) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM documents 
        WHERE is_active = 1
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      db.all(query, [limit, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Les utilisateurs NE PEUVENT PAS modifier les documents
  // Seuls les admins peuvent faire cela
  static async delete(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const query = 'UPDATE documents SET is_active = 0 WHERE id = ?';
      db.run(query, [id], function(err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  static trackDownload(userId, documentId) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO document_downloads (user_id, document_id) VALUES (?, ?)';
      db.run(query, [userId, documentId], function(err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }
}
