import { getDatabase } from '../config/database.js';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'jimsterlyfrancois@gmail.com';

const ACADEMIC_MATRIX = {
  FSE: ['Psychopédagogie', 'Administration Scolaire', 'Mathématiques et Physique', 'Histoire et Géographie'],
  'ESSAP/MT/TS': ['Santé Publique', 'Médecine Tropicale', 'Travail Social'],
  ESUTH: ['Gestion Touristique', 'Hôtellerie et Restauration'],
  FDSPRI: ['Sciences Juridiques', 'Science Politique', 'Relations Internationales'],
};

export class User {
  static async create(email, password, faculty, option, level) {
    const db = getDatabase();
    const passwordHash = await bcrypt.hash(password, 10);
    const isAdmin = email === ADMIN_EMAIL;

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users (email, password_hash, faculty, option, level, is_admin)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.run(query, [email, passwordHash, faculty, option, level, isAdmin ? 1 : 0], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, email, faculty, option, level, is_admin: isAdmin });
      });
    });
  }

  static async findByEmail(email) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ? AND is_active = 1';
      db.get(query, [email], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  static async findById(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, email, faculty, option, level, is_admin FROM users WHERE id = ? AND is_active = 1';
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  static async verifyPassword(user, plainPassword) {
    return bcrypt.compare(plainPassword, user.password_hash);
  }

  static isOptionAllowed(option) {
    const allowedOptions = ['Psychopédagogie', 'Administration Scolaire'];
    return allowedOptions.includes(option);
  }

  static canAccessDocuments(userOption) {
    return this.isOptionAllowed(userOption);
  }

  static getAcademicMatrix() {
    return ACADEMIC_MATRIX;
  }

  static isAdmin(email) {
    return email === ADMIN_EMAIL;
  }
}
