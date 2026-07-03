import { getDatabase } from '../config/database.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  const db = getDatabase();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🌱 Initialisation de la base de données...');

      // ============================
      // Compte Administrateur
      // ============================
      const adminPassword = bcrypt.hashSync('Admin@2026', 10);

      db.run(
        `INSERT OR IGNORE INTO users
        (email, password_hash, faculty, option, level, is_admin, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          'jimsterlyfrancois@gmail.com',
          adminPassword,
          "Faculté des Sciences de l'Éducation",
          'Psychopédagogie',
          'L4',
          1,
          1
        ]
      );

      console.log('✅ Compte administrateur créé.');

      // ============================
      // Mot de passe des comptes de démonstration
      // ============================
      const studentPassword = bcrypt.hashSync('Etudiant@2026', 10);

      const students = [
        [
          'etudiant.l1@upnch.ht',
          studentPassword,
          "Faculté des Sciences de l'Éducation",
          'Psychopédagogie',
          'L1',
          0,
          1
        ],
        [
          'etudiant.l2@upnch.ht',
          studentPassword,
          "Faculté des Sciences de l'Éducation",
          'Psychopédagogie',
          'L2',
          0,
          1
        ],
        [
          'etudiant.l3@upnch.ht',
          studentPassword,
          "Faculté des Sciences de l'Éducation",
          'Psychopédagogie',
          'L3',
          0,
          1
        ],
        [
          'etudiant.l4@upnch.ht',
          studentPassword,
          "Faculté des Sciences de l'Éducation",
          'Psychopédagogie',
          'L4',
          0,
          1
        ]
      ];

      const stmt = db.prepare(
        `INSERT OR IGNORE INTO users
        (email, password_hash, faculty, option, level, is_admin, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)`
      );

      students.forEach((student) => {
        stmt.run(student);
      });

      stmt.finalize((err) => {
        if (err) {
          reject(err);
          return;
        }

        console.log('✅ Comptes étudiants créés.');
        console.log('🎉 Base de données initialisée avec succès.');
        resolve();
      });
    });
  });
};

export default seedDatabase;
