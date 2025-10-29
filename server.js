// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { Pool } = require('pg'); //DB
const bcrypt = require('bcryptjs'); //Passwords
                         
const app = express();
const PORT = process.env.PORT || 5000;
const normalizeEmail = (e='') => e.trim().toLowerCase();
const digitsOnly = (s='') => s.replace(/\D/g, ''); // phone normalization

// trust Render proxy
app.set('trust proxy', 1);

// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(compression());

// DB
let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

// API route
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'api', ts: Date.now() });
});

// API health
app.get('/api/db-health', async (_req, res) => {
  if (!pool) return res.json({ ok: true, db: 'not-configured' });
  try {
    const r = await pool.query('SELECT 1 AS ok');
    res.json({ ok: true, db: r.rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/auth/login  { email, password }
app.post('/api/auth/login', async (req, res) => {
  if (!pool) return res.status(503).json({ ok: false, error: 'db-not-configured' });
  const { email = '', password = '' } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok: false, error: 'missing-fields' });

  try {
    const cRes = await pool.query(
      `SELECT customer_id, first_name, last_name, phone, email
       FROM customers
       WHERE LOWER(email) = $1
       LIMIT 1`,
      [normalizeEmail(email)]
    );

    if (cRes.rowCount === 0) {
      return res.status(401).json({ ok: false, error: 'invalid-credentials' });
    }

    const customer = cRes.rows[0];

    const aRes = await pool.query(
      `SELECT password_hash FROM customer_auth WHERE customer_id = $1`,
      [customer.customer_id]
    );

    if (aRes.rowCount === 0) {
      return res.status(401).json({ ok: false, error: 'no-password-set' });
    }

    const ok = await bcrypt.compare(password, aRes.rows[0].password_hash);
    if (!ok) return res.status(401).json({ ok: false, error: 'invalid-credentials' });

    // fetch vehicles
    const vRes = await pool.query(
      `SELECT vehicle_id, make, model, color, year, plate_number
       FROM vehicles
       WHERE customer_id = $1
       ORDER BY year DESC NULLS LAST, make ASC, model ASC`,
      [customer.customer_id]
    );

    return res.json({ ok: true, customer, vehicles: vRes.rows });
  } catch (err) {
    console.error('[auth/login error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// POST /api/auth/signup  { first_name, last_name, email, phone, password }
app.post('/api/auth/signup', async (req, res) => {
  if (!pool) return res.status(503).json({ ok: false, error: 'db-not-configured' });

  const { first_name='', last_name='', email='', phone='', password='' } = req.body || {};

  if (!first_name.trim() || !last_name.trim() || !email.trim() || !password.trim()) {
    return res.status(400).json({ ok: false, error: 'missing-fields' });
  }
  if (password.length < 8) {
    return res.status(422).json({ ok: false, error: 'weak-password' });
  }

  const emailNorm = normalizeEmail(email);
  const phoneDigits = digitsOnly(phone);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check existence by email (case-insensitive)
    const exists = await client.query(
      `SELECT 1 FROM customers WHERE LOWER(email) = $1`,
      [emailNorm]
    );
    if (exists.rowCount) {
      await client.query('ROLLBACK');
      return res.status(409).json({ ok: false, error: 'email-exists' });
    }

    // Insert customer
    const insCustomer = await client.query(
      `INSERT INTO customers (first_name, last_name, phone, email)
       VALUES ($1, $2, $3, $4)
       RETURNING customer_id, first_name, last_name, phone, email`,
      [first_name.trim(), last_name.trim(), phoneDigits, emailNorm]
    );

    const customer = insCustomer.rows[0];

    // Hash + insert password
    const hash = await bcrypt.hash(password, 10);
    await client.query(
      `INSERT INTO customer_auth (customer_id, password_hash)
       VALUES ($1, $2)`,
      [customer.customer_id, hash]
    );

    await client.query('COMMIT');
    return res.status(201).json({ ok: true, message: 'Account created. Please log in.' });
  } catch (err) {
    // Map common PG errors → useful status/messages
    console.error('[auth/signup error]', err);

    // Unique violation (e.g., email uniqueness)
    if (err.code === '23505') {
      return res.status(409).json({ ok: false, error: 'email-exists' });
    }
    // Undefined table/column
    if (err.code === '42P01' || err.code === '42703') {
      return res.status(500).json({ ok: false, error: 'schema-missing' });
    }
    // Not-null violations
    if (err.code === '23502') {
      return res.status(400).json({ ok: false, error: 'missing-fields' });
    }

    return res.status(500).json({ ok: false, error: 'server-error' });
  } finally {
    client.release();
  }
});

// POST /api/vehicles - add a vehicle for a customer
// Body: { customer_id, make, model, year, color, plate, vin }
app.post('/api/vehicles', async (req, res) => {
  if (!pool) return res.status(503).json({ ok: false, error: 'db-not-configured' });

  const {
    customer_id,
    make = '',
    model = '',
    year = '',
    color = '',
    plate = '',
    vin = ''
  } = req.body || {};

  // Basic validation
  if (!customer_id || !make.trim() || !model.trim()) {
    return res.status(400).json({ ok: false, error: 'missing-fields' });
  }
  const yrNum = year ? Number(String(year).slice(0, 4)) : null;
  if (yrNum && (yrNum < 1900 || yrNum > 2100)) {
    return res.status(422).json({ ok: false, error: 'bad-year' });
  }

  try {
    const insert = await pool.query(
      `INSERT INTO vehicles (customer_id, make, model, year, color, plate_number, vin)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING vehicle_id, make, model, year, color, plate_number, vin`,
      [
        Number(customer_id),
        make.trim(),
        model.trim(),
        yrNum,
        color.trim() || null,
        plate.trim() || null,
        vin.trim() || null
      ]
    );

    // Return the new vehicle + refreshed list
    const vRes = await pool.query(
      `SELECT vehicle_id, make, model, color, year, plate_number, vin
         FROM vehicles
        WHERE customer_id = $1
        ORDER BY year DESC NULLS LAST, make ASC, model ASC`,
      [Number(customer_id)]
    );

    return res.status(201).json({
      ok: true,
      vehicle: insert.rows[0],
      vehicles: vRes.rows
    });
  } catch (err) {
    console.error('[vehicles/add error]', err);

    // FK violation (customer missing)
    if (err.code === '23503') {
      return res.status(422).json({ ok: false, error: 'invalid-customer' });
    }
    // Unique VIN constraint
    if (err.code === '23505') {
      return res.status(409).json({ ok: false, error: 'duplicate' });
    }
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// GET /api/services - list all services for dropdowns
app.get('/api/services', async (_req, res) => {
  if (!pool) return res.status(503).json({ ok: false, error: 'db-not-configured' });
  try {
    const r = await pool.query(
      `SELECT service_id, name, description, hourly_rate, default_hours
         FROM services
        ORDER BY name ASC`
    );
    res.json({ ok: true, services: r.rows });
  } catch (err) {
    console.error('[services/list error]', err);
    res.status(500).json({ ok: false, error: 'server-error' });
  }
});


// 404
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// react build in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, 'client', 'build');
  app.use(express.static(clientBuildPath));

// fallback
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on :${PORT}`);
});
