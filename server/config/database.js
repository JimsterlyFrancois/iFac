import fs from 'fs';  
import path from 'path';  
import { fileURLToPath } from 'url';  
  
const __filename = fileURLToPath(import.meta.url);  
const __dirname = path.dirname(__filename);  
  
let client = null; // sqlite3.Database OU pg.Pool  
let dbType = null;  
  
export const initializeDatabase = async () => {  
  dbType = process.env.DB_TYPE || 'sqlite';  
  
  if (dbType === 'sqlite') return initializeSQLite();  
  if (dbType === 'postgres') return initializePostgres();  
  
  throw new Error(`Unsupported database type: ${dbType}`);  
};  
  
const initializeSQLite = async () => {  
  const { default: sqlite3 } = await import('sqlite3');  
  
  const dbPath = process.env.DB_PATH || './data/ifac.db';  
  const dir = path.dirname(dbPath);  
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });  
  
  await new Promise((resolve, reject) => {  
    client = new sqlite3.Database(dbPath, (err) => (err ? reject(err) : resolve()));  
  });  
  console.log('✅ Connected to SQLite database');  
  
  // chemin corrigé : database/schema.sql à la racine du projet  
  const schemaPath = path.join(__dirname, '../../database/schema.sql');  
  if (!fs.existsSync(schemaPath)) {  
    throw new Error(`Schema file not found: ${schemaPath}`);  
  }  
  const schema = fs.readFileSync(schemaPath, 'utf8');  
  
  await new Promise((resolve, reject) => {  
    client.exec(schema, (err) => (err ? reject(err) : resolve()));  
  });  
  console.log('✅ Database schema initialized (sqlite)');  
  return client;  
};  
  
const initializePostgres = async () => {  
  const { default: pg } = await import('pg');  
  
  const pool = new pg.Pool(  
    process.env.DATABASE_URL  
      ? {  
          connectionString: process.env.DATABASE_URL,  
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,  
        }  
      : {  
          host: process.env.DB_HOST,  
          port: process.env.DB_PORT,  
          user: process.env.DB_USER,  
          password: process.env.DB_PASSWORD,  
          database: process.env.DB_NAME,  
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,  
        }  
  );  
  
  pool.on('error', (err) => console.error('❌ PostgreSQL idle error:', err));  
  
  // vérifie vraiment la connexion (erreur claire au démarrage sinon)  
  try {  
    const c = await pool.connect();  
    c.release();  
  } catch (err) {  
    console.error('❌ PostgreSQL connection failed:', err.message);  
    throw err;  
  }  
  
  client = pool; // <-- assignation qui manquait  
  console.log('✅ Connected to PostgreSQL database');  
  return client;  
};  
  
export const getDatabase = () => {  
  if (!client) {  
    throw new Error('Database not initialized. Call initializeDatabase first.');  
  }  
  return client;  
};  
  
// transforme les "?" en "$1, $2..." pour PostgreSQL  
const toPg = (sql) => {  
  let i = 0;  
  return sql.replace(/\?/g, () => `$${++i}`);  
};  
  
// SELECT -> renvoie { rows }  
export const query = async (sql, params = []) => {  
  if (dbType === 'postgres') {  
    const res = await client.query(toPg(sql), params);  
    return { rows: res.rows, rowCount: res.rowCount };  
  }  
  return new Promise((resolve, reject) => {  
    client.all(sql, params, (err, rows) =>  
      err ? reject(err) : resolve({ rows: rows || [], rowCount: rows?.length || 0 })  
    );  
  });  
};  
  
// INSERT -> renvoie { id }  
export const insert = async (sql, params = []) => {  
  if (dbType === 'postgres') {  
    const res = await client.query(`${toPg(sql)} RETURNING id`, params);  
    return { id: res.rows[0]?.id };  
  }  
  return new Promise((resolve, reject) => {  
    client.run(sql, params, function (err) {  
      err ? reject(err) : resolve({ id: this.lastID });  
    });  
  });  
};  
  
// UPDATE / DELETE -> renvoie { changes }  
export const execute = async (sql, params = []) => {  
  if (dbType === 'postgres') {  
    const res = await client.query(toPg(sql), params);  
    return { changes: res.rowCount };  
  }  
  return new Promise((resolve, reject) => {  
    client.run(sql, params, function (err) {  
      err ? reject(err) : resolve({ changes: this.changes });  
    });  
  });  
};  
  
export const closeDatabase = async () => {  
  if (!client) return;  
  if (dbType === 'postgres') await client.end();  
  else await new Promise((r) => client.close(r));  
  client = null;  
};