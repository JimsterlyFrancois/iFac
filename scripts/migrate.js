import 'dotenv/config';  
import fs from 'fs';  
import path from 'path';  
import { fileURLToPath } from 'url';  
import { initializeDatabase, getDatabase, closeDatabase } from '../server/config/database.js';  
  
const __filename = fileURLToPath(import.meta.url);  
const __dirname = path.dirname(__filename);  
  
const runMigration = async () => {  
  const dbType = process.env.DB_TYPE || 'sqlite';  
  console.log(`🚀 Migration démarrée (DB_TYPE=${dbType})...`);  
  
  // Choisit le bon fichier de schéma  
  const schemaFile =  
    dbType === 'postgres' ? 'schema.postgres.sql' : 'schema.sql';  
  const schemaPath = path.join(__dirname, '../database', schemaFile);  
  
  if (!fs.existsSync(schemaPath)) {  
    throw new Error(`Fichier de schéma introuvable : ${schemaPath}`);  
  }  
  
  const schema = fs.readFileSync(schemaPath, 'utf8');  
  
  // Ouvre la connexion (crée aussi le dossier data/ en SQLite)  
  await initializeDatabase();  
  const client = getDatabase();  
  
  if (dbType === 'postgres') {  
    // pg exécute plusieurs instructions en une seule requête  
    await client.query(schema);  
  } else {  
    // sqlite : exec gère plusieurs instructions  
    await new Promise((resolve, reject) => {  
      client.exec(schema, (err) => (err ? reject(err) : resolve()));  
    });  
  }  
  
  console.log('✅ Tables créées avec succès.');  
  await closeDatabase();  
};  
  
runMigration().catch((err) => {  
  console.error('❌ Migration échouée :', err.message);  
  process.exit(1);  
});