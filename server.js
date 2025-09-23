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
