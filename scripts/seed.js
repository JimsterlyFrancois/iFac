import 'dotenv/config';  
import bcrypt from 'bcryptjs';  
import { initializeDatabase, insert, closeDatabase } from '../server/config/database.js';  
  
const upsertUser = async (u) => {  
  await insert(  
    `INSERT INTO users (email, password_hash, faculty, option, level, is_admin, is_active)  
     VALUES (?, ?, ?, ?, ?, ?, ?)  
     ON CONFLICT (email) DO NOTHING`,  
    [u.email, u.hash, u.faculty, u.option, u.level, u.is_admin, true]  
  );  
};  
  
const seedDatabase = async () => {  
  console.log('🌱 Initialisation de la base de données...');  
  
  const adminEmail = process.env.SEED_ADMIN_EMAIL;  
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;  
  if (!adminEmail || !adminPassword) {  
    throw new Error('SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD doivent être définis dans .env');  
  }  
  
  await upsertUser({  
    email: adminEmail,  
    hash: bcrypt.hashSync(adminPassword, 10),  
    faculty: process.env.SEED_ADMIN_FACULTY || "Faculté des Sciences de l'Éducation",  
    option: process.env.SEED_ADMIN_OPTION || 'Psychopédagogie',  
    level: process.env.SEED_ADMIN_LEVEL || 'L4',  
    is_admin: true,  
  });  
  console.log('✅ Compte administrateur créé.');  
  
  const studentPassword = process.env.SEED_STUDENT_PASSWORD;  
  if (studentPassword) {  
    const hash = bcrypt.hashSync(studentPassword, 10);  
    for (const level of ['L1', 'L2', 'L3', 'L4']) {  
      await upsertUser({  
        email: `etudiant.${level.toLowerCase()}@upnch.ht`,  
        hash,  
        faculty: "Faculté des Sciences de l'Éducation",  
        option: 'Psychopédagogie',  
        level,  
        is_admin: false,  
      });  
    }  
    console.log('✅ Comptes étudiants créés.');  
  }  
  
  console.log('🎉 Base de données initialisée avec succès.');  
};  
  
const run = async () => {  
  await initializeDatabase();  
  await seedDatabase();  
  await closeDatabase();  
};  
  
run().catch((err) => {  
  console.error('❌ Seed failed:', err);  
  process.exit(1);  
});  
  
export default seedDatabase;