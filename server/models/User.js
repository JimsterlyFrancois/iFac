import { getDatabase } from '../config/database.js';
import bcrypt from 'bcryptjs';

export class User {

  // =========================
  // CREATE USER
  // =========================
  static async create(email, password, faculty, option, level, isAdmin = false) {
    const db = getDatabase();

    const passwordHash = await bcrypt.hash(password, 10);

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users
        (email, password_hash, faculty, option, level, is_admin)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.run(
        query,
        [email, passwordHash, faculty, option, level, isAdmin ? 1 : 0],
        function (err) {
          if (err) return reject(err);

          resolve({
            id: this.lastID,
            email,
            faculty,
            option,
            level,
            is_admin: isAdmin
          });
        }
      );
    });
  }

  // =========================
  // FIND BY EMAIL
  // =========================
  static async findByEmail(email) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM users WHERE email = ? AND is_active = 1`,
        [email],
        (err, row) => {
          if (err) return reject(err);
          resolve(row || null);
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
        `SELECT id, email, faculty, option, level, is_admin, is_active
         FROM users WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) return reject(err);
          resolve(row || null);
        }
      );
    });
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
    return user?.is_admin === 1;
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
