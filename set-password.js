// scripts/set-password.js
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

(async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const email = 'john.doe@example.com';
  const plain = 'test1234';

  const client = await pool.connect();
  try {
    const cRes = await client.query(
      `SELECT customer_id FROM customers WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email]
    );
    if (!cRes.rowCount) throw new Error('No customer with that email');

    const customer_id = cRes.rows[0].customer_id;
    const hash = await bcrypt.hash(plain, 10);

    await client.query(
      `INSERT INTO customer_auth (customer_id, password_hash)
       VALUES ($1,$2)
       ON CONFLICT (customer_id) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [customer_id, hash]
    );

    console.log('Password set for', email);
  } finally {
    client.release();
    pool.end();
  }
})().catch(e => {
  console.error(e);
  process.exit(1);
});
