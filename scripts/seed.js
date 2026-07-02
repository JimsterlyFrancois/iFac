import { getDatabase } from '../config/database.js';
import { User } from './User.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  const db = getDatabase();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Admin user
      const adminPassword = bcrypt.hashSync('admin123', 10);
      db.run(
        `INSERT OR IGNORE INTO users (email, password_hash, faculty, option, level, is_admin, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['jimsterlyfrancois@gmail.com', adminPassword, 'FSE', 'Psychopédagogie', 'L4', 1, 1]
      );

      // Test users
      const userPassword = bcrypt.hashSync('user123', 10);
      
      db.run(
        `INSERT OR IGNORE INTO users (email, password_hash, faculty, option, level, is_admin, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['student1@example.com', userPassword, 'FSE', 'Psychopédagogie', 'L1', 0, 1]
      );

      db.run(
        `INSERT OR IGNORE INTO users (email, password_hash, faculty, option, level, is_admin, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['student2@example.com', userPassword, 'FSE', 'Administration Scolaire', 'L2', 0, 1],
        (err) => {
          if (err) reject(err);
          else {
            console.log('✅ Database seeded successfully');
            resolve();
          }
        }
      );
    });
  });
};

export default seedDatabase;
