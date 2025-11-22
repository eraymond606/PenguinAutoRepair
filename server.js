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

// POST /api/employee/login  { technician_id, password }
app.post('/api/employee/login', async (req, res) => {
  if (!pool) return res.status(503).json({ ok: false, error: 'db-not-configured' });
  const { technician_id, password } = req.body || {};

  if (!technician_id || !password) {
    return res.status(400).json({ ok: false, error: 'missing-fields' });
  }

  try {
    // Get technician and password hash
    const authRes = await pool.query(
      `SELECT t.technician_id, t.first_name, t.last_name, t.phone, t.email, t.position, t.hourly_wage, ta.password_hash
       FROM technicians t
       INNER JOIN technician_auth ta ON t.technician_id = ta.technician_id
       WHERE t.technician_id = $1
       LIMIT 1`,
      [technician_id]
    );

    if (authRes.rowCount === 0) {
      return res.status(401).json({ ok: false, error: 'invalid-credentials' });
    }

    const row = authRes.rows[0];
    const { password_hash, ...technician } = row;

    // Verify password with bcrypt
    const passwordMatch = await bcrypt.compare(password, password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ ok: false, error: 'invalid-credentials' });
    }

    return res.json({ ok: true, technician });
  } catch (err) {
    console.error('[employee/login error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// POST /api/employee/reset-password  { email, new_password }
app.post('/api/employee/reset-password', async (req, res) => {
  if (!pool) return res.status(503).json({ ok: false, error: 'db-not-configured' });
  const { email, new_password } = req.body || {};

  if (!email || !new_password) {
    return res.status(400).json({ ok: false, error: 'missing-fields' });
  }

  try {
    // Find technician by email
    const techRes = await pool.query(
      `SELECT technician_id FROM technicians WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email]
    );

    if (techRes.rowCount === 0) {
      return res.status(404).json({ ok: false, error: 'email-not-found' });
    }

    const technician_id = techRes.rows[0].technician_id;

    // Hash the new password
    const password_hash = await bcrypt.hash(new_password, 10);

    // Update or insert password
    await pool.query(
      `INSERT INTO technician_auth (technician_id, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (technician_id) DO UPDATE SET password_hash = $2`,
      [technician_id, password_hash]
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error('[employee/reset-password error]', err);
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

// GET /api/appointments/availability?service_id=X&date=YYYY-MM-DD
app.get('/api/appointments/availability', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { service_id, date } = req.query;

  if (!service_id || !date) {
    return res.status(400).json({ ok: false, error: 'missing-parameters' });
  }

  try {
    // Get service duration
    const svc = await pool.query(
      'SELECT default_hours FROM services WHERE service_id = $1',
      [service_id]
    );

    if (svc.rowCount === 0) {
      return res.status(404).json({ ok: false, error: 'service-not-found' });
    }

    const serviceHours = svc.rows[0].default_hours || 1;

    // Check if there are any qualified technicians
    const qualifiedCount = await pool.query(
      `SELECT COUNT(*) as tech_count
       FROM technician_services
       WHERE service_id = $1`,
      [service_id]
    );

    const hasQualifiedTechs = parseInt(qualifiedCount.rows[0].tech_count) > 0;

    // Get all appointments for the specified date
    const appointments = await pool.query(
      `SELECT start_time, end_time
       FROM appointments
       WHERE DATE(start_time) = $1
       ORDER BY start_time`,
      [date]
    );

    // Generate business hours (e.g., 8 AM to 5 PM in 30-minute slots)
    const slots = [];
    for (let hour = 8; hour < 17; hour++) {
      for (let minute of [0, 30]) {
        if (hour === 16 && minute === 30) break; // stop at 4:30 PM for last slot

        const slotStart = `${date} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

        // Calculate slot end time
        const endTimeResult = await pool.query(
          `SELECT $1::timestamp + ($2 || ' hours')::interval AS end_time`,
          [slotStart, serviceHours]
        );
        const slotEnd = endTimeResult.rows[0].end_time;

        // Count overlapping appointments
        const overlapping = appointments.rows.filter(appt => {
          const apptStart = new Date(appt.start_time);
          const apptEnd = new Date(appt.end_time);
          const checkStart = new Date(slotStart);
          const checkEnd = new Date(slotEnd);

          return apptStart < checkEnd && apptEnd > checkStart;
        });

        const available = hasQualifiedTechs && overlapping.length < 3;

        slots.push({
          start_time: slotStart,
          end_time: slotEnd.toISOString(),
          available,
          bookings: overlapping.length,
          max_bookings: 3
        });
      }
    }

    return res.json({
      ok: true,
      service_id,
      date,
      service_duration_hours: serviceHours,
      has_qualified_technicians: hasQualifiedTechs,
      slots
    });
  } catch (err) {
    console.error('[appointments/availability error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// POST /api/appointments  { customer_id, vehicle_id, service_id, start_time }
app.post('/api/appointments', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { customer_id, vehicle_id, service_id, start_time } = req.body || {};

  if (!customer_id || !vehicle_id || !service_id || !start_time) {
    return res.status(400).json({ ok: false, error: 'missing-fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get service details to calculate end_time
    const svc = await client.query(
      'SELECT service_id, default_hours FROM services WHERE service_id = $1',
      [service_id]
    );

    if (svc.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ ok: false, error: 'service-not-found' });
    }

    const service = svc.rows[0];
    const serviceHours = service.default_hours || 1;

    // Calculate end_time using PostgreSQL interval
    const endTimeResult = await client.query(
      `SELECT $1::timestamp + ($2 || ' hours')::interval AS end_time`,
      [start_time, serviceHours]
    );
    const end_time = endTimeResult.rows[0].end_time;

    // Find technicians qualified for this service
    const qualifiedTechs = await client.query(
      `SELECT t.technician_id, t.first_name, t.last_name
       FROM technicians t
       INNER JOIN technician_services ts ON t.technician_id = ts.technician_id
       WHERE ts.service_id = $1`,
      [service_id]
    );

    if (qualifiedTechs.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(422).json({
        ok: false,
        error: 'no-qualified-technicians',
        message: 'No technicians are qualified for this service'
      });
    }

    // Check time slot availability (max 3 concurrent appointments)
    // An appointment conflicts if its time range overlaps with the requested slot
    const conflictingAppts = await client.query(
      `SELECT COUNT(*) as conflict_count
       FROM appointments
       WHERE start_time < $1 AND end_time > $2`,
      [end_time, start_time]
    );

    const currentBookings = parseInt(conflictingAppts.rows[0].conflict_count);
    if (currentBookings >= 3) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        ok: false,
        error: 'time-slot-full',
        message: 'This time slot is fully booked. Maximum 3 appointments per time slot.'
      });
    }

    // Find available technician (one who isn't booked during this time range)
    const availableTech = await client.query(
      `SELECT t.technician_id, t.first_name, t.last_name
       FROM technicians t
       INNER JOIN technician_services ts ON t.technician_id = ts.technician_id
       WHERE ts.service_id = $1
       AND NOT EXISTS (
         SELECT 1 FROM appointments a
         WHERE a.technician_id = t.technician_id
         AND a.start_time < $2
         AND a.end_time > $3
       )
       LIMIT 1`,
      [service_id, end_time, start_time]
    );

    if (availableTech.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        ok: false,
        error: 'no-available-technicians',
        message: 'All qualified technicians are booked for this time slot'
      });
    }

    const assignedTech = availableTech.rows[0];

    // Create appointment with assigned technician
    const result = await client.query(
      `INSERT INTO appointments (customer_id, vehicle_id, service_id, start_time, end_time, technician_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING appointment_id, technician_id`,
      [customer_id, vehicle_id, service_id, start_time, end_time, assignedTech.technician_id]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      ok: true,
      appointment_id: result.rows[0].appointment_id,
      technician_id: result.rows[0].technician_id,
      technician_name: `${assignedTech.first_name} ${assignedTech.last_name}`,
      start_time,
      end_time
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[appointments/create error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  } finally {
    client.release();
  }
});

// GET /api/appointments/grouped-by-date - Get all appointments grouped by date
app.get('/api/appointments/grouped-by-date', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  try {
    const result = await pool.query(
      `SELECT
         DATE(a.start_time) as date,
         COUNT(*) as count
       FROM appointments a
       WHERE a.start_time >= CURRENT_DATE
       GROUP BY DATE(a.start_time)
       ORDER BY date ASC
       LIMIT 30`
    );

    return res.json({
      ok: true,
      dates: result.rows
    });
  } catch (err) {
    console.error('[appointments/grouped-by-date error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// GET /api/appointments/by-date?date=YYYY-MM-DD - Get appointments for a specific date
app.get('/api/appointments/by-date', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ ok: false, error: 'missing-date' });
  }

  try {
    const result = await pool.query(
      `SELECT
         a.appointment_id,
         a.start_time,
         a.end_time,
         a.status,
         c.customer_id,
         c.first_name,
         c.last_name,
         s.name as service_name,
         t.technician_id,
         t.first_name as tech_first_name,
         t.last_name as tech_last_name
       FROM appointments a
       INNER JOIN customers c ON a.customer_id = c.customer_id
       INNER JOIN services s ON a.service_id = s.service_id
       LEFT JOIN technicians t ON a.technician_id = t.technician_id
       WHERE DATE(a.start_time) = $1
       ORDER BY a.start_time ASC`,
      [date]
    );

    return res.json({
      ok: true,
      date,
      appointments: result.rows
    });
  } catch (err) {
    console.error('[appointments/by-date error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// GET /api/appointments/:id - Get full appointment details
app.get('/api/appointments/:id', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT
         a.appointment_id,
         a.start_time,
         a.end_time,
         a.status,
         c.customer_id,
         c.first_name as customer_first_name,
         c.last_name as customer_last_name,
         c.phone as customer_phone,
         c.email as customer_email,
         s.service_id,
         s.name as service_name,
         s.description as service_description,
         v.vehicle_id,
         v.make,
         v.model,
         v.year,
         v.color,
         v.plate_number,
         v.vin,
         t.technician_id,
         t.first_name as tech_first_name,
         t.last_name as tech_last_name,
         t.phone as tech_phone
       FROM appointments a
       INNER JOIN customers c ON a.customer_id = c.customer_id
       INNER JOIN services s ON a.service_id = s.service_id
       INNER JOIN vehicles v ON a.vehicle_id = v.vehicle_id
       LEFT JOIN technicians t ON a.technician_id = t.technician_id
       WHERE a.appointment_id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, error: 'appointment-not-found' });
    }

    return res.json({
      ok: true,
      appointment: result.rows[0]
    });
  } catch (err) {
    console.error('[appointments/get-by-id error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// GET /api/appointments/:id/available-technicians - Get available technicians for reassignment
app.get('/api/appointments/:id/available-technicians', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { id } = req.params;

  try {
    // Get appointment details
    const apptResult = await pool.query(
      `SELECT service_id, start_time, end_time, technician_id
       FROM appointments
       WHERE appointment_id = $1`,
      [id]
    );

    if (apptResult.rowCount === 0) {
      return res.status(404).json({ ok: false, error: 'appointment-not-found' });
    }

    const { service_id, start_time, end_time, technician_id } = apptResult.rows[0];

    // Find available technicians qualified for this service
    const availableTechs = await pool.query(
      `SELECT
         t.technician_id,
         t.first_name,
         t.last_name,
         t.position,
         CASE WHEN t.technician_id = $4 THEN true ELSE false END as is_current
       FROM technicians t
       INNER JOIN technician_services ts ON t.technician_id = ts.technician_id
       WHERE ts.service_id = $1
       AND NOT EXISTS (
         SELECT 1 FROM appointments a
         WHERE a.technician_id = t.technician_id
         AND a.appointment_id != $5
         AND a.start_time < $2
         AND a.end_time > $3
       )
       ORDER BY is_current DESC, t.last_name ASC, t.first_name ASC`,
      [service_id, end_time, start_time, technician_id, id]
    );

    return res.json({
      ok: true,
      appointment_id: id,
      current_technician_id: technician_id,
      available_technicians: availableTechs.rows
    });
  } catch (err) {
    console.error('[appointments/available-technicians error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// PATCH /api/appointments/:id/reassign - Reassign technician
app.patch('/api/appointments/:id/reassign', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { id } = req.params;
  const { technician_id } = req.body;

  if (!technician_id) {
    return res.status(400).json({ ok: false, error: 'missing-technician-id' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get appointment details
    const apptResult = await client.query(
      `SELECT service_id, start_time, end_time
       FROM appointments
       WHERE appointment_id = $1`,
      [id]
    );

    if (apptResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ ok: false, error: 'appointment-not-found' });
    }

    const { service_id, start_time, end_time } = apptResult.rows[0];

    // Verify technician is qualified
    const qualifiedCheck = await client.query(
      `SELECT 1 FROM technician_services
       WHERE technician_id = $1 AND service_id = $2`,
      [technician_id, service_id]
    );

    if (qualifiedCheck.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(422).json({ ok: false, error: 'technician-not-qualified' });
    }

    // Verify technician is available
    const conflictCheck = await client.query(
      `SELECT 1 FROM appointments
       WHERE technician_id = $1
       AND appointment_id != $2
       AND start_time < $3
       AND end_time > $4`,
      [technician_id, id, end_time, start_time]
    );

    if (conflictCheck.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ ok: false, error: 'technician-not-available' });
    }

    // Update appointment
    const updateResult = await client.query(
      `UPDATE appointments
       SET technician_id = $1
       WHERE appointment_id = $2
       RETURNING appointment_id`,
      [technician_id, id]
    );

    // Get technician name
    const techResult = await client.query(
      `SELECT first_name, last_name FROM technicians WHERE technician_id = $1`,
      [technician_id]
    );

    await client.query('COMMIT');

    return res.json({
      ok: true,
      appointment_id: updateResult.rows[0].appointment_id,
      technician_id,
      technician_name: `${techResult.rows[0].first_name} ${techResult.rows[0].last_name}`
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[appointments/reassign error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  } finally {
    client.release();
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
