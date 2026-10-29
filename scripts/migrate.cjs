const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const sql = fs.readFileSync(path.join(__dirname, '../lib/schema.sql'), 'utf8');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

pool.query(sql)
  .then(() => { console.log('Schema criado!'); pool.end(); })
  .catch((err) => { console.error('Erro:', err.message); pool.end(); process.exit(1); });
