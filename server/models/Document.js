import path from 'path';  
import { query, insert, execute } from '../config/database.js';  
  
export class Document {  
  
  // =========================  
  // CREATE DOCUMENT  
  // =========================  
  static async create(documentData) {  
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
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  
    ];  
  
    const fileExtension = path.extname(file_name).toLowerCase();  
    const allowedExtensions = ['.pdf', '.doc', '.docx'];  
  
    if (  
      !allowedTypes.includes(file_type) ||  
      !allowedExtensions.includes(fileExtension)  
    ) {  
      throw new Error('Format de fichier non autorisé');  
    }  
  
    const { id } = await insert(  
      `INSERT INTO documents  
       (title, description, file_url, file_name, file_size, file_type,  
        target_faculty, target_option, target_level, category, uploaded_by)  
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,  
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
      ]  
    );  
  
    return { id, ...documentData };  
  }  
  
  // =========================  
  // FIND BY ID  
  // =========================  
  static async findById(id) {  
    const { rows } = await query(  
      'SELECT * FROM documents WHERE id = ? AND is_active = TRUE',  
      [id]  
    );  
    return rows[0] || null;  
  }  
  
  // =========================  
  // USER DOCUMENT FEED (+ recherche)  
  // =========================  
  static async findForUser(user, limit = 20, offset = 0, search = '') {  
    // sécurité pagination  
    limit = Math.min(Math.max(limit, 1), 50);  
    offset = Math.max(offset, 0);  
  
    const params = [user.faculty, user.option, user.level];  
    let sql = `  
      SELECT * FROM documents  
      WHERE is_active = TRUE  
        AND target_faculty = ?  
        AND target_option = ?  
        AND (target_level = ? OR target_level = 'ALL')`;  
  
    if (search) {  
      sql += ` AND (title LIKE ? OR description LIKE ? OR category LIKE ?)`;  
      const like = `%${search}%`;  
      params.push(like, like, like);  
    }  
  
    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;  
    params.push(limit, offset);  
  
    const { rows } = await query(sql, params);  
    return rows;  
  }  
  
  // =========================  
  // COUNT USER DOCUMENTS (+ recherche)  
  // =========================  
  static async countForUser(user, search = '') {  
    const params = [user.faculty, user.option, user.level];  
    let sql = `  
      SELECT COUNT(*) AS total FROM documents  
      WHERE is_active = TRUE  
        AND target_faculty = ?  
        AND target_option = ?  
        AND (target_level = ? OR target_level = 'ALL')`;  
  
    if (search) {  
      sql += ` AND (title LIKE ? OR description LIKE ? OR category LIKE ?)`;  
      const like = `%${search}%`;  
      params.push(like, like, like);  
    }  
  
    const { rows } = await query(sql, params);  
    return Number(rows[0]?.total || 0);  
  }  
  
  // =========================  
  // ADMIN VIEW ALL  
  // =========================  
  static async findAll(limit = 20, offset = 0) {  
    limit = Math.min(Math.max(limit, 1), 50);  
    offset = Math.max(offset, 0);  
  
    const { rows } = await query(  
      `SELECT * FROM documents WHERE is_active = TRUE  
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,  
      [limit, offset]  
    );  
    return rows;  
  }  
  
  // =========================  
  // SOFT DELETE  
  // =========================  
  static async delete(id) {  
    await execute('UPDATE documents SET is_active = FALSE WHERE id = ?', [id]);  
    return true;  
  }  
  
  // =========================  
  // TRACK DOWNLOAD  
  // =========================  
  static async trackDownload(userId, documentId) {  
    await insert(  
      `INSERT INTO document_downloads (user_id, document_id) VALUES (?, ?)`,  
      [userId, documentId]  
    );  
    return true;  
  }  
}