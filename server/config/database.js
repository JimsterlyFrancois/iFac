import sqlite3 from 'sqlite3';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

export const initializeDatabase = async () => {
  const dbType = process.env.DB_TYPE || 'sqlite';

  if (dbType === 'sqlite') {
    return initializeSQLite();
  } else if (dbType === 'postgres') {
    return initializePostgres();
  } else {
    throw new Error(`Unsupported database type: ${dbType}`);
  }
};

const initializeSQLite = () => {
  return new Promise((resolve, reject) => {
    const dbPath = process.env.DB_PATH || './data/ifac.db';
    const dir = path.dirname(dbPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new sqlite3.Database(dbPath, (err) => {
      if (err) reject(err);
      console.log('✅ Connected to SQLite database');

      db.serialize(() => {
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema, (err) => {
          if (err) reject(err);
          else {
            console.log('✅ Database schema initialized');
            resolve(db);
          }
        });
      });
    });
  });
};

const initializePostgres = () => {
  const pool = new pg.Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  console.log('✅ Connected to PostgreSQL database');
  return pool;
};

export const getDatabase = () => db;
