// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { Pool } = require('pg'); //DB
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
                         
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

// Staff Login API
app.post('/api/staff/login', async (req, res) => {
  const { email, password } = req.body;

  if (!pool) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Query to get technician and their auth info
    const query = `
      SELECT 
        t.technician_id,
        t.first_name,
        t.last_name,
        t.email,
        ta.password_hash
      FROM technicians t
      INNER JOIN technician_auth ta ON t.technician_id = ta.technician_id
      WHERE t.email = $1
    `;
    
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const technician = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, technician.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: technician.technician_id,
        email: technician.email,
        role: 'staff',
        firstName: technician.first_name,
        lastName: technician.last_name
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return token and user info
    res.json({
      token,
      user: {
        id: technician.technician_id,
        email: technician.email,
        firstName: technician.first_name,
        lastName: technician.last_name,
        role: 'staff'
      }
    });

  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
