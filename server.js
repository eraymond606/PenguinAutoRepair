// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { Pool } = require('pg'); //DB
                         
const app = express();
const PORT = process.env.PORT || 5000;

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


// POST /api/customers/lookup
// Body: {first: string, last: string, phone: string}
app.post('/api/customers/lookup', async (req, res) => {
  if (!pool) {
    console.error('[lookup] No DB pool – set DATABASE_URL in .env');
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { first = '', last = '', phone = '' } = req.body || {};
  if (!first.trim() || !last.trim() || !phone.trim()) {
    return res.status(400).json({ ok: false, error: 'Missing fields' });
  }

    // normalize phone to digits
    const digits = phone.replace(/\D/g, '');

  try {
    console.log('[lookup] payload:', { first, last, digits });
  
    // look for matching customer
    const customerSql = `
      SELECT customer_id, first_name, last_name, phone
      FROM customers
      WHERE first_name ILIKE $1
        AND last_name  ILIKE $2
        AND phone = $3
      LIMIT 1
    `;
    const c = await pool.query(customerSql, [first.trim(), last.trim(), digits]);

    if (c.rowCount === 0) {
      console.log('[lookup] customer not found');
      return res.status(404).json({ ok: false, error: 'not-found' });
    }

    const customer = c.rows[0];

    // pull all vehicles tied to this customer
    const vehiclesSql = `
      SELECT vehicle_id, make, model, color, year, plate_number
      FROM vehicles
      WHERE customer_id = $1
      ORDER BY year DESC NULLS LAST, make ASC, model ASC
    `;
    const v = await pool.query(vehiclesSql, [customer.customer_id]);

    console.log('[lookup] found', {
      customer_id: customer.customer_id,
      vehicles: v.rowCount
    });

    res.json({ ok: true, customer, vehicles: v.rows });
  } catch (err) {
    console.error('[lookup error]', err);
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
