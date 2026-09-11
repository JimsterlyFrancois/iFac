import bcrypt from 'bcryptjs';  
import { query, insert, execute } from '../config/database.js';  
  
const toBool = (v) => v === true || v === 1;  
  
export class User {  
  
  // =========================  
  // CREATE USER  
  // =========================  
  static async create(email, password, faculty, option, level, isAdmin = false) {  
    const passwordHash = await bcrypt.hash(password, 10);  
  
    const { id } = await insert(  
      `INSERT INTO users  
       (email, password_hash, faculty, option, level, is_admin)  
       VALUES (?, ?, ?, ?, ?, ?)`,  
      [email, passwordHash, faculty, option, level, isAdmin]  
    );  
  
    return {  
      id,  
      email,  
      faculty,  
      option,  
      level,  
      is_admin: isAdmin,  
    };  
  }  
  
  // =========================  
  // FIND BY EMAIL  
  // =========================  
  static async findByEmail(email) {  
    const { rows } = await query(  
      'SELECT * FROM users WHERE email = ? AND is_active = TRUE',  
      [email]  
    );  
    return rows[0] || null;  
  }  
  
  // =========================  
  // FIND BY ID  
  // =========================  
  static async findById(id) {  
    const { rows } = await query(  
      `SELECT id, email, faculty, option, level, is_admin, is_active  
       FROM users WHERE id = ?`,  
      [id]  
    );  
    return rows[0] || null;  
  }  

  static async promoteToAdmin(email) {
    return execute('UPDATE users SET is_admin = ? WHERE email = ?', [true, email]);
  }
  
  // =========================  
  // PASSWORD CHECK  
  // =========================  
  static async verifyPassword(user, plainPassword) {  
    return bcrypt.compare(plainPassword, user.password_hash);  
  }  
  
  // =========================  
  // ROLE CHECK (BASIQUE - EXTENSIBLE)  
  // =========================  
  static isAdmin(user) {  
    return toBool(user?.is_admin);  
  }  
  
  // =========================  
  // DOCUMENT ACCESS RULE  
  // =========================  
  static canAccessDocuments(user) {  
    if (!user) return false;  
  
    // règle simple MVP (sera remplacée par RBAC plus tard)  
    const allowedOptions = [  
      'Psychopédagogie',  
      'Administration Scolaire',  
      'Mathématiques et Physique',  
      'Histoire et Géographie'  
    ];  
  
    return allowedOptions.includes(user.option);  
  }  
  
  // =========================  
  // ACADEMIC MATRIX (TEMPORAIRE)  
  // =========================  
  static getAcademicMatrix() {  
    return {  
      FSE: [  
        'Psychopédagogie',  
        'Administration Scolaire',  
        'Mathématiques et Physique',  
        'Histoire et Géographie'  
      ],  
      'ESSAP/MT/TS': [  
        'Santé Publique',  
        'Médecine Tropicale',  
        'Travail Social'  
      ],  
      ESUTH: [  
        'Gestion Touristique',  
        'Hôtellerie et Restauration'  
      ],  
      FDSPRI: [  
        'Sciences Juridiques',  
        'Science Politique',  
        'Relations Internationales'  
      ]  
    };  
  }  
}