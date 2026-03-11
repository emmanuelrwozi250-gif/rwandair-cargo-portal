/**
 * RwandAir Cargo · Unified Local Server v2
 * ─────────────────────────────────────────
 * Serves the portal UI + REST API on a single port.
 * All data persisted as JSON files in server/data/.
 *
 * Start:  npm run server
 * URL:    http://localhost:3001
 * API:    http://localhost:3001/api
 */

const express  = require('express');
const cors     = require('cors');
const crypto   = require('crypto');
const fs       = require('fs');
const path     = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;
const DATA = path.join(__dirname, 'data');
const PUB  = path.join(__dirname, '..', 'public');

// ── In-memory session store ──────────────────────────────────
const sessions = new Map(); // token → { userId, role, name, station, initials, title, loginAt }

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Logger
app.use((req, res, next) => {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] ${req.method.padEnd(6)} ${req.path}`);
  next();
});

// Serve static portal files
app.use(express.static(PUB));

// ── Helpers ───────────────────────────────────────────────────
const read  = f => { const p = path.join(DATA, f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : []; };
const write = (f, d) => fs.writeFileSync(path.join(DATA, f), JSON.stringify(d, null, 2));
const genId = (prefix = 'ID') => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const genAWB = () => `206-${Math.floor(Math.random() * 90000 + 10000)}`;
const genToken = () => crypto.randomBytes(32).toString('hex');

// ── Auth Middleware ───────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : req.query.token;
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorised — please log in', code: 'UNAUTHORIZED' });
  }
  req.session = sessions.get(token);
  req.token   = token;
  next();
}

// Optional auth (doesn't block, just attaches session if present)
function optAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : req.query.token;
  if (token && sessions.has(token)) req.session = sessions.get(token);
  next();
}

// ── Validation helpers ────────────────────────────────────────
function validate(obj, rules) {
  const errors = [];
  for (const [field, rule] of Object.entries(rules)) {
    const val = obj[field];
    if (rule.required && (val === undefined || val === null || val === '')) {
      errors.push(`${field} is required`);
    } else if (val !== undefined && val !== '') {
      if (rule.minLen && String(val).length < rule.minLen) errors.push(`${field} must be at least ${rule.minLen} characters`);
      if (rule.maxLen && String(val).length > rule.maxLen) errors.push(`${field} must not exceed ${rule.maxLen} characters`);
      if (rule.min && Number(val) < rule.min) errors.push(`${field} must be at least ${rule.min}`);
      if (rule.max && Number(val) > rule.max) errors.push(`${field} must not exceed ${rule.max}`);
      if (rule.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) errors.push(`${field} must be a valid email`);
      if (rule.isNumber && isNaN(Number(val))) errors.push(`${field} must be a number`);
    }
  }
  return errors;
}

// ── ROOT: Serve login page ────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(PUB, 'login.html'));
});

// ══════════════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════════════

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const errors = validate(req.body, {
    email:    { required: true, isEmail: true },
    password: { required: true, minLen: 4 }
  });
  if (errors.length) return res.status(400).json({ error: errors[0], errors });

  const users = read('users.json');
  const user  = users.find(u => u.email.toLowerCase() === req.body.email.toLowerCase());
  if (!user || user.password !== req.body.password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = genToken();
  const session = {
    userId: user.id, email: user.email, name: user.name,
    role: user.role, station: user.station, initials: user.initials,
    title: user.title, loginAt: new Date().toISOString()
  };
  sessions.set(token, session);

  // Log login event
  const events = read('events.json');
  events.unshift({ type: 'LOGIN', userId: user.id, name: user.name, role: user.role, at: session.loginAt });
  write('events.json', events.slice(0, 500)); // keep last 500

  console.log(`  ✓ Login: ${user.name} (${user.role} · ${user.station})`);
  res.json({ token, user: { ...session } });
});

// GET /api/auth/me
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ session: req.session });
});

// POST /api/auth/logout
app.post('/api/auth/logout', requireAuth, (req, res) => {
  sessions.delete(req.token);
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/sessions (admin only)
app.get('/api/auth/sessions', requireAuth, (req, res) => {
  if (req.session.role !== 'mgmt') return res.status(403).json({ error: 'Management access only' });
  const active = [...sessions.entries()].map(([tok, s]) => ({
    token: tok.slice(0, 8) + '…', ...s
  }));
  res.json({ count: active.length, sessions: active });
});

// ══════════════════════════════════════════════════════════════
//  BOOKINGS
// ══════════════════════════════════════════════════════════════

// GET /api/bookings
app.get('/api/bookings', optAuth, (req, res) => {
  let data = read('bookings.json');
  const { status, origin, destination, search, limit, offset } = req.query;

  if (status)      data = data.filter(b => b.status === status);
  if (origin)      data = data.filter(b => b.origin === origin);
  if (destination) data = data.filter(b => b.destination === destination);
  if (search) {
    const q = search.toLowerCase();
    data = data.filter(b =>
      b.awb.toLowerCase().includes(q) ||
      (b.shipper||'').toLowerCase().includes(q) ||
      (b.consignee||'').toLowerCase().includes(q) ||
      (b.route||'').toLowerCase().includes(q)
    );
  }

  const total = data.length;
  const off   = parseInt(offset) || 0;
  const lim   = parseInt(limit)  || 100;
  const page  = data.slice(off, off + lim);

  res.json({ total, count: page.length, offset: off, limit: lim, bookings: page });
});

// GET /api/bookings/:awb
app.get('/api/bookings/:awb', optAuth, (req, res) => {
  const data    = read('bookings.json');
  const booking = data.find(b => b.awb === req.params.awb);
  if (!booking) return res.status(404).json({ error: 'Booking not found', awb: req.params.awb });
  res.json(booking);
});

// POST /api/bookings
app.post('/api/bookings', optAuth, (req, res) => {
  const errors = validate(req.body, {
    origin:      { required: true, minLen: 2, maxLen: 4 },
    destination: { required: true, minLen: 2, maxLen: 4 },
    weight:      { required: true, isNumber: true, min: 0.1, max: 100000 },
    shipper:     { required: true, minLen: 2, maxLen: 120 },
  });
  if (errors.length) return res.status(400).json({ error: errors[0], errors });

  const awb     = genAWB();
  const booking = {
    id:             genId('BK'),
    awb,
    route:          `${req.body.origin}→${req.body.destination}`,
    origin:         req.body.origin.toUpperCase(),
    destination:    req.body.destination.toUpperCase(),
    status:         'Booked',
    date:           new Date().toISOString().slice(0, 10),
    weight:         Number(req.body.weight),
    volume:         Number(req.body.volume)    || 0,
    commodity:      req.body.commodity         || 'General Cargo',
    shipper:        req.body.shipper,
    consignee:      req.body.consignee         || '',
    specialHandling:req.body.specialHandling   || 'None',
    notes:          req.body.notes             || '',
    flight:         req.body.flight            || 'TBC',
    ratePerKg:      req.body.ratePerKg         || 3.85,
    totalRate:      req.body.ratePerKg ? (req.body.ratePerKg * Number(req.body.weight)).toFixed(2) : (3.85 * Number(req.body.weight)).toFixed(2),
    createdAt:      new Date().toISOString(),
    createdBy:      req.session ? req.session.name : 'portal',
    createdByRole:  req.session ? req.session.role : 'unknown',
  };

  // Save booking
  const bookings = read('bookings.json');
  bookings.unshift(booking);
  write('bookings.json', bookings);

  // Create shipment record
  const shipments = read('shipments.json');
  shipments.unshift({
    awb, status: 'Booked',
    origin: booking.origin, destination: booking.destination,
    shipper: booking.shipper, weight: booking.weight,
    timeline: [{ stage: 'Booked', time: new Date().toISOString(), location: booking.origin, note: 'Booking confirmed via portal' }]
  });
  write('shipments.json', shipments);

  // Audit event
  const events = read('events.json');
  events.unshift({ type: 'BOOKING_CREATED', awb, route: booking.route, weight: booking.weight, by: booking.createdBy, at: booking.createdAt });
  write('events.json', events.slice(0, 500));

  console.log(`  ✓ New booking: AWB ${awb} | ${booking.route} | ${booking.weight}kg | by ${booking.createdBy}`);
  res.status(201).json({ message: 'Booking confirmed', awb, booking });
});

// PATCH /api/bookings/:awb/status
app.patch('/api/bookings/:awb/status', requireAuth, (req, res) => {
  const allowed = ['Booked','Collected','In Transit','Customs Clearance','Out for Delivery','Delivered','Cancelled','On Hold'];
  const { status, location, note } = req.body;

  if (!status) return res.status(400).json({ error: 'status is required' });
  if (!allowed.includes(status)) return res.status(400).json({ error: `Invalid status. Must be one of: ${allowed.join(', ')}` });

  const bookings = read('bookings.json');
  const idx = bookings.findIndex(b => b.awb === req.params.awb);
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' });

  bookings[idx].status    = status;
  bookings[idx].updatedAt = new Date().toISOString();
  bookings[idx].updatedBy = req.session.name;
  write('bookings.json', bookings);

  const shipments = read('shipments.json');
  const sIdx = shipments.findIndex(s => s.awb === req.params.awb);
  if (sIdx !== -1) {
    shipments[sIdx].status = status;
    shipments[sIdx].timeline.push({
      stage: status, time: new Date().toISOString(),
      location: location || '', note: note || `Status updated to ${status} by ${req.session.name}`
    });
    write('shipments.json', shipments);
  }

  res.json({ message: 'Status updated', awb: req.params.awb, status, updatedBy: req.session.name });
});

// DELETE /api/bookings/:awb (cancel)
app.delete('/api/bookings/:awb', requireAuth, (req, res) => {
  const bookings = read('bookings.json');
  const idx = bookings.findIndex(b => b.awb === req.params.awb);
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' });
  if (bookings[idx].status === 'Delivered') return res.status(400).json({ error: 'Cannot cancel a delivered shipment' });

  bookings[idx].status      = 'Cancelled';
  bookings[idx].cancelledAt = new Date().toISOString();
  bookings[idx].cancelledBy = req.session.name;
  write('bookings.json', bookings);
  res.json({ message: 'Booking cancelled', awb: req.params.awb });
});

// ══════════════════════════════════════════════════════════════
//  TRACKING
// ══════════════════════════════════════════════════════════════

app.get('/api/track/:awb', optAuth, (req, res) => {
  const shipments = read('shipments.json');
  const shipment  = shipments.find(s => s.awb === req.params.awb);
  if (shipment) return res.json(shipment);

  // Fallback to bookings record
  const bookings = read('bookings.json');
  const booking  = bookings.find(b => b.awb === req.params.awb);
  if (!booking) return res.status(404).json({ error: 'AWB not found', awb: req.params.awb });

  res.json({
    awb: booking.awb, status: booking.status,
    origin: booking.origin, destination: booking.destination,
    shipper: booking.shipper, weight: booking.weight,
    timeline: [{ stage: booking.status, time: booking.createdAt, location: booking.origin, note: 'Booking confirmed' }]
  });
});

// ══════════════════════════════════════════════════════════════
//  STATS & ANALYTICS
// ══════════════════════════════════════════════════════════════

app.get('/api/stats', optAuth, (req, res) => {
  const bookings = read('bookings.json');
  const byStatus = {};
  let totalWeight = 0, totalRevenue = 0;

  bookings.forEach(b => {
    byStatus[b.status] = (byStatus[b.status] || 0) + 1;
    totalWeight  += Number(b.weight)    || 0;
    totalRevenue += Number(b.totalRate) || 0;
  });

  res.json({
    totalBookings:    bookings.length,
    byStatus,
    totalWeightKg:    Math.round(totalWeight),
    totalRevenueUSD:  Math.round(totalRevenue),
    activeShipments:  (byStatus['In Transit'] || 0) + (byStatus['Customs Clearance'] || 0) + (byStatus['Out for Delivery'] || 0),
    delivered:        byStatus['Delivered'] || 0,
    activeSessions:   sessions.size,
    timestamp:        new Date().toISOString(),
  });
});

// GET /api/live — lightweight poll endpoint (returns stats + recent events)
app.get('/api/live', optAuth, (req, res) => {
  const bookings = read('bookings.json');
  const events   = read('events.json').slice(0, 5);
  res.json({
    bookingCount: bookings.length,
    recentEvents: events,
    serverTime:   new Date().toISOString(),
    sessions:     sessions.size,
  });
});

// ══════════════════════════════════════════════════════════════
//  USERS (admin only)
// ══════════════════════════════════════════════════════════════

app.get('/api/users', requireAuth, (req, res) => {
  if (req.session.role !== 'mgmt') return res.status(403).json({ error: 'Management access only' });
  const users = read('users.json').map(u => ({ ...u, password: '***' }));
  res.json({ count: users.length, users });
});

// ══════════════════════════════════════════════════════════════
//  EVENTS / AUDIT LOG
// ══════════════════════════════════════════════════════════════

app.get('/api/events', requireAuth, (req, res) => {
  if (!['mgmt','commercial'].includes(req.session.role)) return res.status(403).json({ error: 'Access denied' });
  const events = read('events.json');
  res.json({ count: events.length, events: events.slice(0, 100) });
});

// ══════════════════════════════════════════════════════════════
//  EXPORT
// ══════════════════════════════════════════════════════════════

app.get('/api/export/bookings.csv', optAuth, (req, res) => {
  const bookings = read('bookings.json');
  const headers  = ['AWB','Route','Origin','Destination','Status','Date','Weight(kg)','Volume(CBM)','Commodity','Shipper','Consignee','Flight','Rate/kg','Total(USD)','CreatedBy','CreatedAt'];
  const rows     = bookings.map(b => [
    b.awb, b.route, b.origin, b.destination, b.status, b.date,
    b.weight, b.volume, `"${b.commodity}"`, `"${b.shipper}"`, `"${b.consignee||''}"`,
    b.flight, b.ratePerKg, b.totalRate, `"${b.createdBy||''}"`, b.createdAt
  ].join(','));
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="rwandair-cargo-bookings.csv"');
  res.send([headers.join(','), ...rows].join('\n'));
});

// ══════════════════════════════════════════════════════════════
//  HEALTH
// ══════════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({
    status:   'ok',
    server:   'RwandAir Cargo Local API v2',
    port:     PORT,
    dataDir:  DATA,
    sessions: sessions.size,
    uptime:   Math.round(process.uptime()) + 's',
    time:     new Date().toISOString(),
  });
});

// SPA catch-all: portal routes
app.get(['/portal*', '/login*'], (req, res) => {
  const file = req.path.replace(/^\//, '');
  const full = path.join(PUB, file);
  if (fs.existsSync(full)) return res.sendFile(full);
  res.sendFile(path.join(PUB, 'login.html'));
});

// 404
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Endpoint not found', path: req.path });
  res.redirect('/');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────
// Ensure data files exist
['bookings.json','shipments.json','users.json','events.json'].forEach(f => {
  const p = path.join(DATA, f);
  if (!fs.existsSync(p)) fs.writeFileSync(p, '[]');
});

app.listen(PORT, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✈  RwandAir Cargo · Unified Portal Server v2');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Portal: http://localhost:${PORT}`);
  console.log(`  API:    http://localhost:${PORT}/api`);
  console.log(`  Data:   ${DATA}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Demo credentials (all use password: cargo2026)');
  console.log('  ┌────────────────────────────────────────────────┐');
  console.log('  │ admin@rwandair.com        → Management         │');
  console.log('  │ gsa.lagos@rwandair.com    → GSA / Agent        │');
  console.log('  │ warehouse.nbo@rwandair.com→ Warehouse Ops      │');
  console.log('  │ planning@rwandair.com     → Network Planning   │');
  console.log('  │ commercial@rwandair.com   → HQ Commercial      │');
  console.log('  └────────────────────────────────────────────────┘\n');
});
