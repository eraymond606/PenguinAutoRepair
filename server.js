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

// Cleanup function to delete past appointments
const cleanupPastAppointments = async () => {
  if (!pool) return;
  try {
    const result = await pool.query(
      `DELETE FROM appointments WHERE DATE(start_time) < CURRENT_DATE`
    );
    if (result.rowCount > 0) {
      console.log(`[cleanup] Deleted ${result.rowCount} past appointment(s)`);
    }
  } catch (err) {
    console.error('[cleanup] Failed to delete past appointments:', err);
  }
};

// Generate invoices for existing appointments that don't have one
const generateMissingInvoices = async () => {
  if (!pool) return;
  try {
    // Find appointments without invoices
    const result = await pool.query(
      `SELECT a.appointment_id, a.customer_id, a.service_id, a.start_time,
              s.hourly_rate, s.default_hours
       FROM appointments a
       INNER JOIN services s ON a.service_id = s.service_id
       LEFT JOIN invoices i ON a.appointment_id = i.appointment_id
       WHERE i.invoice_id IS NULL`
    );

    if (result.rowCount === 0) {
      return;
    }

    let created = 0;
    for (const appt of result.rows) {
      const hourlyRate = parseFloat(appt.hourly_rate) || 0;
      const serviceHours = parseFloat(appt.default_hours) || 1;
      const subtotal = hourlyRate * serviceHours;
      const taxRate = 0.065; // 6.5% tax
      const tax = subtotal * taxRate;
      const total = subtotal + tax;

      await pool.query(
        `INSERT INTO invoices (appointment_id, customer_id, invoice_date, subtotal, tax)
         VALUES ($1, $2, DATE($3), $4, $5)`,
        [appt.appointment_id, appt.customer_id, appt.start_time, subtotal.toFixed(2), tax.toFixed(2)]
      );
      created++;
    }

    if (created > 0) {
      console.log(`[invoices] Generated ${created} invoice(s) for existing appointments`);
    }
  } catch (err) {
    console.error('[invoices] Failed to generate missing invoices:', err);
  }
};

// Generate repairs for existing appointments that don't have one
const generateMissingRepairs = async () => {
  if (!pool) return;
  try {
    // Find appointments without repairs
    const result = await pool.query(
      `SELECT a.appointment_id
       FROM appointments a
       LEFT JOIN repairs r ON a.appointment_id = r.appointment_id
       WHERE r.repair_id IS NULL`
    );

    if (result.rowCount === 0) {
      return;
    }

    let created = 0;
    for (const appt of result.rows) {
      await pool.query(
        `INSERT INTO repairs (appointment_id, status)
         VALUES ($1, 'in_progress')`,
        [appt.appointment_id]
      );
      created++;
    }

    if (created > 0) {
      console.log(`[repairs] Generated ${created} repair(s) for existing appointments`);
    }
  } catch (err) {
    console.error('[repairs] Failed to generate missing repairs:', err);
  }
};

// Run invoice generation FIRST on startup (before cleanup deletes past appointments)
generateMissingInvoices();

// Run repair generation on startup
generateMissingRepairs();

// Run cleanup on startup (after invoice and repair generation)
cleanupPastAppointments();

// Run cleanup daily (every 24 hours)
setInterval(cleanupPastAppointments, 24 * 60 * 60 * 1000);

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

// POST /api/services - Create a new service
app.post('/api/services', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const {
    name,
    description,
    hourly_rate,
    default_hours
  } = req.body || {};

  if (!name?.trim()) {
    return res.status(400).json({ ok: false, error: 'missing-fields' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO services (name, description, hourly_rate, default_hours)
       VALUES ($1, $2, $3, $4)
       RETURNING service_id, name, description, hourly_rate, default_hours`,
      [
        name.trim(),
        description || null,
        hourly_rate || null,
        default_hours || null
      ]
    );

    return res.status(201).json({
      ok: true,
      service: result.rows[0]
    });
  } catch (err) {
    console.error('[services/create error]', err);

    if (err.code === '23505') {
      return res.status(409).json({ ok: false, error: 'duplicate-entry' });
    }

    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// PUT /api/services/:id - Update a service
app.put('/api/services/:id', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { id } = req.params;
  const {
    name,
    description,
    hourly_rate,
    default_hours
  } = req.body || {};

  if (!name?.trim()) {
    return res.status(400).json({ ok: false, error: 'missing-fields' });
  }

  try {
    const result = await pool.query(
      `UPDATE services
       SET name = $1, description = $2, hourly_rate = $3, default_hours = $4
       WHERE service_id = $5
       RETURNING service_id, name, description, hourly_rate, default_hours`,
      [
        name.trim(),
        description || null,
        hourly_rate || null,
        default_hours || null,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, error: 'service-not-found' });
    }

    return res.json({
      ok: true,
      service: result.rows[0]
    });
  } catch (err) {
    console.error('[services/update error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// DELETE /api/services/:id - Delete a service
app.delete('/api/services/:id', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM services WHERE service_id = $1 RETURNING service_id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, error: 'service-not-found' });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('[services/delete error]', err);

    if (err.code === '23503') {
      return res.status(409).json({
        ok: false,
        error: 'service-in-use',
        message: 'Cannot delete service that has appointments'
      });
    }

    return res.status(500).json({ ok: false, error: 'server-error' });
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

    // Get service details to calculate end_time and invoice amount
    const svc = await client.query(
      'SELECT service_id, default_hours, hourly_rate FROM services WHERE service_id = $1',
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

    const appointmentId = result.rows[0].appointment_id;

    // Calculate invoice amounts
    const hourlyRate = parseFloat(service.hourly_rate) || 0;
    const subtotal = hourlyRate * serviceHours;
    const taxRate = 0.065; // 6.5% tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Create invoice for the appointment
    const invoiceResult = await client.query(
      `INSERT INTO invoices (appointment_id, customer_id, invoice_date, subtotal, tax)
       VALUES ($1, $2, DATE($3), $4, $5)
       RETURNING invoice_id, total`,
      [appointmentId, customer_id, start_time, subtotal.toFixed(2), tax.toFixed(2)]
    );

    // Create repair record for this appointment
    await client.query(
      `INSERT INTO repairs (appointment_id, status)
       VALUES ($1, 'in_progress')`,
      [appointmentId]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      ok: true,
      appointment_id: appointmentId,
      technician_id: result.rows[0].technician_id,
      technician_name: `${assignedTech.first_name} ${assignedTech.last_name}`,
      start_time,
      end_time,
      invoice_id: invoiceResult.rows[0].invoice_id,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
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

// GET /api/technicians - Get all technicians
app.get('/api/technicians', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  try {
    const result = await pool.query(
      `SELECT technician_id, first_name, last_name, phone, email, position, hourly_wage
       FROM technicians
       ORDER BY technician_id ASC`
    );

    return res.json({
      ok: true,
      technicians: result.rows
    });
  } catch (err) {
    console.error('[technicians/list error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// POST /api/technicians - Create a new technician
app.post('/api/technicians', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const {
    first_name,
    last_name,
    email,
    phone,
    position,
    hourly_wage
  } = req.body || {};

  if (!first_name?.trim() || !last_name?.trim()) {
    return res.status(400).json({ ok: false, error: 'missing-fields' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO technicians (first_name, last_name, email, phone, position, hourly_wage)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING technician_id, first_name, last_name, email, phone, position, hourly_wage`,
      [
        first_name.trim(),
        last_name.trim(),
        email || null,
        phone ? digitsOnly(phone) : null,
        position || null,
        hourly_wage || null
      ]
    );

    return res.status(201).json({
      ok: true,
      technician: result.rows[0]
    });
  } catch (err) {
    console.error('[technicians/create error]', err);

    if (err.code === '23505') {
      return res.status(409).json({ ok: false, error: 'duplicate-entry' });
    }

    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// PUT /api/technicians/:id - Update a technician
app.put('/api/technicians/:id', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { id } = req.params;
  const {
    first_name,
    last_name,
    email,
    phone,
    position,
    hourly_wage
  } = req.body || {};

  if (!first_name?.trim() || !last_name?.trim()) {
    return res.status(400).json({ ok: false, error: 'missing-fields' });
  }

  try {
    const result = await pool.query(
      `UPDATE technicians
       SET first_name = $1, last_name = $2, email = $3, phone = $4, position = $5, hourly_wage = $6
       WHERE technician_id = $7
       RETURNING technician_id, first_name, last_name, email, phone, position, hourly_wage`,
      [
        first_name.trim(),
        last_name.trim(),
        email || null,
        phone ? digitsOnly(phone) : null,
        position || null,
        hourly_wage || null,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, error: 'technician-not-found' });
    }

    return res.json({
      ok: true,
      technician: result.rows[0]
    });
  } catch (err) {
    console.error('[technicians/update error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// DELETE /api/technicians/:id - Delete a technician
app.delete('/api/technicians/:id', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM technicians WHERE technician_id = $1 RETURNING technician_id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, error: 'technician-not-found' });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('[technicians/delete error]', err);

    // Foreign key constraint - technician has appointments
    if (err.code === '23503') {
      return res.status(409).json({
        ok: false,
        error: 'technician-has-appointments',
        message: 'Cannot delete technician with existing appointments'
      });
    }

    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// GET /api/technicians/:id/appointments - Get appointments for a specific technician
app.get('/api/technicians/:id/appointments', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT a.appointment_id, a.customer_id, a.vehicle_id, a.service_id,
              a.start_time, a.end_time, a.status,
              c.first_name as customer_first_name, c.last_name as customer_last_name,
              s.name as service_name,
              v.make, v.model, v.year, v.color
       FROM appointments a
       INNER JOIN customers c ON a.customer_id = c.customer_id
       INNER JOIN services s ON a.service_id = s.service_id
       INNER JOIN vehicles v ON a.vehicle_id = v.vehicle_id
       WHERE a.technician_id = $1
       AND DATE(a.start_time) >= CURRENT_DATE
       ORDER BY a.start_time ASC`,
      [id]
    );

    return res.json({
      ok: true,
      appointments: result.rows
    });
  } catch (err) {
    console.error('[technicians/appointments error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// POST /api/invoices/generate - Generate invoices for existing appointments without one
app.post('/api/invoices/generate', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  try {
    // Find appointments without invoices
    const result = await pool.query(
      `SELECT a.appointment_id, a.customer_id, a.service_id, a.start_time,
              s.hourly_rate, s.default_hours, s.name as service_name
       FROM appointments a
       INNER JOIN services s ON a.service_id = s.service_id
       LEFT JOIN invoices i ON a.appointment_id = i.appointment_id
       WHERE i.invoice_id IS NULL`
    );

    console.log('[invoices/generate] Found appointments without invoices:', result.rowCount);

    if (result.rowCount === 0) {
      return res.json({ ok: true, message: 'No appointments without invoices', created: 0 });
    }

    const created = [];
    for (const appt of result.rows) {
      const hourlyRate = parseFloat(appt.hourly_rate) || 0;
      const serviceHours = parseFloat(appt.default_hours) || 1;
      const subtotal = hourlyRate * serviceHours;
      const taxRate = 0.065;
      const tax = subtotal * taxRate;
      const total = subtotal + tax;

      const invoiceResult = await pool.query(
        `INSERT INTO invoices (appointment_id, customer_id, invoice_date, subtotal, tax)
         VALUES ($1, $2, DATE($3), $4, $5)
         RETURNING invoice_id, total`,
        [appt.appointment_id, appt.customer_id, appt.start_time, subtotal.toFixed(2), tax.toFixed(2)]
      );

      created.push({
        invoice_id: invoiceResult.rows[0].invoice_id,
        appointment_id: appt.appointment_id,
        service: appt.service_name,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2)
      });
    }

    console.log(`[invoices/generate] Created ${created.length} invoice(s)`);
    return res.json({ ok: true, created: created.length, invoices: created });
  } catch (err) {
    console.error('[invoices/generate error]', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/invoices/:id/details - Get invoice with itemized list
app.get('/api/invoices/:id/details', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { id } = req.params;

  try {
    // Get invoice with customer and appointment info
    const invoiceResult = await pool.query(
      `SELECT i.invoice_id, i.appointment_id, i.customer_id, i.invoice_date,
              i.subtotal, i.tax, i.total,
              c.first_name, c.last_name,
              s.name as service_name, s.hourly_rate, s.default_hours
       FROM invoices i
       INNER JOIN customers c ON i.customer_id = c.customer_id
       LEFT JOIN appointments a ON i.appointment_id = a.appointment_id
       LEFT JOIN services s ON a.service_id = s.service_id
       WHERE i.invoice_id = $1`,
      [id]
    );

    if (invoiceResult.rowCount === 0) {
      return res.status(404).json({ ok: false, error: 'invoice-not-found' });
    }

    const invoice = invoiceResult.rows[0];

    // Get repair parts for this appointment
    let parts = [];
    if (invoice.appointment_id) {
      const partsResult = await pool.query(
        `SELECT p.name, rp.quantity, rp.unit_cost
         FROM repairs r
         INNER JOIN repair_parts rp ON r.repair_id = rp.repair_id
         INNER JOIN parts p ON rp.part_id = p.part_id
         WHERE r.appointment_id = $1`,
        [invoice.appointment_id]
      );
      parts = partsResult.rows;
    }

    return res.json({
      ok: true,
      invoice: {
        ...invoice,
        parts
      }
    });
  } catch (err) {
    console.error('[invoices/details error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// GET /api/invoices - Get all invoices with customer names
app.get('/api/invoices', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  try {
    const result = await pool.query(
      `SELECT i.invoice_id, i.appointment_id, i.customer_id, i.invoice_date,
              i.subtotal, i.tax, i.total,
              c.first_name, c.last_name
       FROM invoices i
       INNER JOIN customers c ON i.customer_id = c.customer_id
       ORDER BY i.invoice_date DESC, i.invoice_id DESC`
    );

    return res.json({
      ok: true,
      invoices: result.rows
    });
  } catch (err) {
    console.error('[invoices/get error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// GET /api/transactions - Get all transactions with customer info
app.get('/api/transactions', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  try {
    const result = await pool.query(
      `SELECT t.transaction_id, t.invoice_id, t.amount, t.method,
              t.transaction_number, t.transaction_date, t.status,
              c.first_name, c.last_name
       FROM transactions t
       INNER JOIN invoices i ON t.invoice_id = i.invoice_id
       INNER JOIN customers c ON i.customer_id = c.customer_id
       ORDER BY t.transaction_date DESC, t.transaction_id DESC`
    );

    return res.json({
      ok: true,
      transactions: result.rows
    });
  } catch (err) {
    console.error('[transactions/get error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// POST /api/transactions - Create a new transaction
app.post('/api/transactions', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { invoice_id, amount, method, transaction_number, status } = req.body;

  if (!invoice_id || !amount) {
    return res.status(400).json({ ok: false, error: 'invoice_id and amount are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO transactions (invoice_id, amount, method, transaction_number, transaction_date, status)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
       RETURNING transaction_id, invoice_id, amount, method, transaction_number, transaction_date, status`,
      [invoice_id, amount, method || null, transaction_number || null, status || 'pending']
    );

    return res.status(201).json({
      ok: true,
      transaction: result.rows[0]
    });
  } catch (err) {
    console.error('[transactions/create error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// PUT /api/transactions/:id - Update a transaction
app.put('/api/transactions/:id', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { id } = req.params;
  const { invoice_id, amount, method, transaction_number, status } = req.body;

  if (!invoice_id || !amount) {
    return res.status(400).json({ ok: false, error: 'invoice_id and amount are required' });
  }

  try {
    const result = await pool.query(
      `UPDATE transactions
       SET invoice_id = $1, amount = $2, method = $3, transaction_number = $4, status = $5
       WHERE transaction_id = $6
       RETURNING transaction_id, invoice_id, amount, method, transaction_number, transaction_date, status`,
      [invoice_id, amount, method || null, transaction_number || null, status || 'pending', id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, error: 'transaction-not-found' });
    }

    return res.json({
      ok: true,
      transaction: result.rows[0]
    });
  } catch (err) {
    console.error('[transactions/update error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// GET /api/customers - Get all customers
app.get('/api/customers', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  try {
    const result = await pool.query(
      `SELECT customer_id, first_name, last_name, phone, email, street, city, state, zip
       FROM customers
       ORDER BY customer_id ASC`
    );

    return res.json({
      ok: true,
      customers: result.rows
    });
  } catch (err) {
    console.error('[customers/get error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// PUT /api/customers/:id - Update a customer
app.put('/api/customers/:id', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { id } = req.params;
  const { first_name, last_name, phone, email, street, city, state, zip } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ ok: false, error: 'first_name and last_name are required' });
  }

  try {
    const result = await pool.query(
      `UPDATE customers
       SET first_name = $1, last_name = $2, phone = $3, email = $4, street = $5, city = $6, state = $7, zip = $8
       WHERE customer_id = $9
       RETURNING customer_id, first_name, last_name, phone, email, street, city, state, zip`,
      [first_name, last_name, phone || null, email || null, street || null, city || null, state || null, zip || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, error: 'customer-not-found' });
    }

    return res.json({
      ok: true,
      customer: result.rows[0]
    });
  } catch (err) {
    console.error('[customers/update error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// GET /api/parts - Get all parts
app.get('/api/parts', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  try {
    const result = await pool.query(
      `SELECT part_id, name, vendor, unit_cost, quantity_in_stock
       FROM parts
       ORDER BY part_id ASC`
    );

    return res.json({
      ok: true,
      parts: result.rows
    });
  } catch (err) {
    console.error('[parts/list error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// POST /api/parts - Create a new part
app.post('/api/parts', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const {
    name,
    vendor,
    unit_cost,
    quantity_in_stock
  } = req.body || {};

  if (!name?.trim()) {
    return res.status(400).json({ ok: false, error: 'missing-fields' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO parts (name, vendor, unit_cost, quantity_in_stock)
       VALUES ($1, $2, $3, $4)
       RETURNING part_id, name, vendor, unit_cost, quantity_in_stock`,
      [
        name.trim(),
        vendor || null,
        unit_cost || null,
        quantity_in_stock || null
      ]
    );

    return res.status(201).json({
      ok: true,
      part: result.rows[0]
    });
  } catch (err) {
    console.error('[parts/create error]', err);

    if (err.code === '23505') {
      return res.status(409).json({ ok: false, error: 'duplicate-entry' });
    }

    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// PUT /api/parts/:id - Update a part
app.put('/api/parts/:id', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { id } = req.params;
  const {
    name,
    vendor,
    unit_cost,
    quantity_in_stock
  } = req.body || {};

  if (!name?.trim()) {
    return res.status(400).json({ ok: false, error: 'missing-fields' });
  }

  try {
    const result = await pool.query(
      `UPDATE parts
       SET name = $1, vendor = $2, unit_cost = $3, quantity_in_stock = $4
       WHERE part_id = $5
       RETURNING part_id, name, vendor, unit_cost, quantity_in_stock`,
      [
        name.trim(),
        vendor || null,
        unit_cost || null,
        quantity_in_stock || null,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, error: 'part-not-found' });
    }

    return res.json({
      ok: true,
      part: result.rows[0]
    });
  } catch (err) {
    console.error('[parts/update error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// DELETE /api/parts/:id - Delete a part
app.delete('/api/parts/:id', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM parts WHERE part_id = $1 RETURNING part_id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, error: 'part-not-found' });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('[parts/delete error]', err);

    if (err.code === '23503') {
      return res.status(409).json({
        ok: false,
        error: 'part-in-use',
        message: 'Cannot delete part that is in use'
      });
    }

    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// GET /api/repairs/by-appointment/:appointmentId - Get repair by appointment ID (auto-creates if missing)
app.get('/api/repairs/by-appointment/:appointmentId', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { appointmentId } = req.params;

  try {
    let result = await pool.query(
      `SELECT repair_id, appointment_id, status
       FROM repairs
       WHERE appointment_id = $1`,
      [appointmentId]
    );

    // If no repair exists, create one
    if (result.rowCount === 0) {
      // Verify appointment exists
      const apptResult = await pool.query(
        `SELECT appointment_id FROM appointments WHERE appointment_id = $1`,
        [appointmentId]
      );

      if (apptResult.rowCount === 0) {
        return res.status(404).json({ ok: false, error: 'appointment-not-found' });
      }

      // Create the repair
      result = await pool.query(
        `INSERT INTO repairs (appointment_id, status)
         VALUES ($1, 'in_progress')
         RETURNING repair_id, appointment_id, status`,
        [appointmentId]
      );
    }

    return res.json({
      ok: true,
      repair: result.rows[0]
    });
  } catch (err) {
    console.error('[repairs/by-appointment error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// PATCH /api/repairs/:repairId/status - Update repair status
app.patch('/api/repairs/:repairId/status', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { repairId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ ok: false, error: 'status is required' });
  }

  try {
    const result = await pool.query(
      `UPDATE repairs
       SET status = $1
       WHERE repair_id = $2
       RETURNING repair_id, status`,
      [status, repairId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, error: 'repair-not-found' });
    }

    return res.json({
      ok: true,
      repair: result.rows[0]
    });
  } catch (err) {
    console.error('[repairs/update-status error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// GET /api/repairs/:repairId/parts - Get parts assigned to a repair
app.get('/api/repairs/:repairId/parts', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { repairId } = req.params;

  try {
    const result = await pool.query(
      `SELECT rp.repair_id, rp.part_id, rp.quantity, rp.unit_cost,
              p.name, p.vendor
       FROM repair_parts rp
       INNER JOIN parts p ON rp.part_id = p.part_id
       WHERE rp.repair_id = $1
       ORDER BY rp.part_id ASC`,
      [repairId]
    );

    return res.json({
      ok: true,
      parts: result.rows
    });
  } catch (err) {
    console.error('[repairs/parts error]', err);
    return res.status(500).json({ ok: false, error: 'server-error' });
  }
});

// POST /api/repairs/:repairId/parts - Add part to a repair and update invoice
app.post('/api/repairs/:repairId/parts', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ ok: false, error: 'db-not-configured' });
  }

  const { repairId } = req.params;
  const { part_id, quantity, unit_cost } = req.body;

  if (!part_id) {
    return res.status(400).json({ ok: false, error: 'part_id is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get the repair to find the appointment_id
    const repairResult = await client.query(
      `SELECT repair_id, appointment_id FROM repairs WHERE repair_id = $1`,
      [repairId]
    );

    if (repairResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ ok: false, error: 'repair-not-found' });
    }

    const appointmentId = repairResult.rows[0].appointment_id;

    // Get the part cost if not provided
    let partCost = unit_cost;
    if (!partCost) {
      const partResult = await client.query(
        `SELECT unit_cost FROM parts WHERE part_id = $1`,
        [part_id]
      );
      if (partResult.rowCount > 0) {
        partCost = partResult.rows[0].unit_cost;
      }
    }

    const qty = quantity || 1;

    // Insert into repair_parts
    const insertResult = await client.query(
      `INSERT INTO repair_parts (repair_id, part_id, quantity, unit_cost)
       VALUES ($1, $2, $3, $4)
       RETURNING repair_id, part_id, quantity, unit_cost`,
      [repairId, part_id, qty, partCost]
    );

    // Get invoice for this appointment and update it
    const invoiceResult = await client.query(
      `SELECT invoice_id, subtotal FROM invoices WHERE appointment_id = $1`,
      [appointmentId]
    );

    if (invoiceResult.rowCount > 0) {
      const invoice = invoiceResult.rows[0];
      const partTotal = parseFloat(partCost || 0) * qty;
      const newSubtotal = parseFloat(invoice.subtotal) + partTotal;
      const taxRate = 0.065;
      const newTax = newSubtotal * taxRate;

      // Update invoice subtotal and tax (total is a generated column)
      await client.query(
        `UPDATE invoices SET subtotal = $1, tax = $2 WHERE invoice_id = $3`,
        [newSubtotal.toFixed(2), newTax.toFixed(2), invoice.invoice_id]
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({
      ok: true,
      repair_part: insertResult.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[repairs/add-part error]', err);
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
