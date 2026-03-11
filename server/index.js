/**
 * RwandAir Cargo · Local API Server
 * Stores all data as JSON files on your PC.
 * Run with: npm run server
 * Listens on: http://localhost:3001
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] ${req.method} ${req.path}`);
  next();
});

// ── JSON File Helpers ───────────────────────────────────────
function readData(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeData(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function generateAWB() {
  return `206-${Math.floor(Math.random() * 90000 + 10000)}`;
}

// ── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'RwandAir Cargo Local API',
    version: '1.0.0',
    dataDir: DATA_DIR,
    timestamp: new Date().toISOString(),
  });
});

// ── BOOKINGS ────────────────────────────────────────────────

// GET /api/bookings — list all bookings (optional ?status= ?origin= ?destination=)
app.get('/api/bookings', (req, res) => {
  let bookings = readData('bookings.json');
  const { status, origin, destination, search } = req.query;
  if (status) bookings = bookings.filter(b => b.status === status);
  if (origin) bookings = bookings.filter(b => b.origin === origin);
  if (destination) bookings = bookings.filter(b => b.destination === destination);
  if (search) {
    const q = search.toLowerCase();
    bookings = bookings.filter(b =>
      b.awb.toLowerCase().includes(q) ||
      b.shipper.toLowerCase().includes(q) ||
      b.route.toLowerCase().includes(q)
    );
  }
  res.json({ count: bookings.length, bookings });
});

// GET /api/bookings/:awb — get a single booking by AWB
app.get('/api/bookings/:awb', (req, res) => {
  const bookings = readData('bookings.json');
  const booking = bookings.find(b => b.awb === req.params.awb);
  if (!booking) return res.status(404).json({ error: 'Booking not found', awb: req.params.awb });
  res.json(booking);
});

// POST /api/bookings — create a new booking
app.post('/api/bookings', (req, res) => {
  const bookings = readData('bookings.json');
  const awb = generateAWB();
  const booking = {
    id: generateId('BK'),
    awb,
    route: `${req.body.origin}→${req.body.destination}`,
    origin: req.body.origin || 'LOS',
    destination: req.body.destination || 'LHR',
    status: 'Booked',
    date: new Date().toISOString().slice(0, 10),
    weight: req.body.weight || 0,
    volume: req.body.volume || 0,
    commodity: req.body.commodity || 'General Cargo',
    shipper: req.body.shipper || '',
    consignee: req.body.consignee || '',
    specialHandling: req.body.specialHandling || 'None',
    notes: req.body.notes || '',
    flight: req.body.flight || 'TBC',
    createdAt: new Date().toISOString(),
    createdBy: req.body.createdBy || 'portal',
  };
  bookings.unshift(booking);
  writeData('bookings.json', bookings);

  // Also add to shipments tracking
  const shipments = readData('shipments.json');
  shipments.unshift({
    awb,
    status: 'Booked',
    origin: booking.origin,
    destination: booking.destination,
    shipper: booking.shipper,
    weight: booking.weight,
    timeline: [
      {
        stage: 'Booked',
        time: new Date().toISOString(),
        location: booking.origin,
        note: 'Booking confirmed via portal',
      },
    ],
  });
  writeData('shipments.json', shipments);

  console.log(`✓ New booking created: AWB ${awb} | ${booking.route} | ${booking.weight}kg`);
  res.status(201).json({ message: 'Booking confirmed', awb, booking });
});

// PATCH /api/bookings/:awb/status — update booking status
app.patch('/api/bookings/:awb/status', (req, res) => {
  const bookings = readData('bookings.json');
  const idx = bookings.findIndex(b => b.awb === req.params.awb);
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' });
  const newStatus = req.body.status;
  bookings[idx].status = newStatus;
  bookings[idx].updatedAt = new Date().toISOString();
  writeData('bookings.json', bookings);

  // Sync shipment status
  const shipments = readData('shipments.json');
  const sIdx = shipments.findIndex(s => s.awb === req.params.awb);
  if (sIdx !== -1) {
    shipments[sIdx].status = newStatus;
    shipments[sIdx].timeline.push({
      stage: newStatus,
      time: new Date().toISOString(),
      location: req.body.location || '',
      note: req.body.note || `Status updated to ${newStatus}`,
    });
    writeData('shipments.json', shipments);
  }

  res.json({ message: 'Status updated', awb: req.params.awb, status: newStatus });
});

// DELETE /api/bookings/:awb — cancel a booking
app.delete('/api/bookings/:awb', (req, res) => {
  const bookings = readData('bookings.json');
  const idx = bookings.findIndex(b => b.awb === req.params.awb);
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' });
  bookings[idx].status = 'Cancelled';
  bookings[idx].cancelledAt = new Date().toISOString();
  writeData('bookings.json', bookings);
  res.json({ message: 'Booking cancelled', awb: req.params.awb });
});

// ── SHIPMENT TRACKING ───────────────────────────────────────

// GET /api/track/:awb — full tracking timeline
app.get('/api/track/:awb', (req, res) => {
  const shipments = readData('shipments.json');
  const shipment = shipments.find(s => s.awb === req.params.awb);
  if (!shipment) {
    // Return a basic record from bookings if it exists
    const bookings = readData('bookings.json');
    const booking = bookings.find(b => b.awb === req.params.awb);
    if (!booking) return res.status(404).json({ error: 'AWB not found', awb: req.params.awb });
    return res.json({
      awb: booking.awb,
      status: booking.status,
      origin: booking.origin,
      destination: booking.destination,
      shipper: booking.shipper,
      weight: booking.weight,
      timeline: [{ stage: booking.status, time: booking.createdAt, location: booking.origin, note: 'Booking confirmed' }],
    });
  }
  res.json(shipment);
});

// ── USERS ───────────────────────────────────────────────────

// GET /api/users — list users (for admin/testing)
app.get('/api/users', (req, res) => {
  const users = readData('users.json');
  res.json({ count: users.length, users });
});

// ── STATS ───────────────────────────────────────────────────

// GET /api/stats — dashboard stats derived from stored data
app.get('/api/stats', (req, res) => {
  const bookings = readData('bookings.json');
  const total = bookings.length;
  const byStatus = {};
  let totalWeight = 0;
  bookings.forEach(b => {
    byStatus[b.status] = (byStatus[b.status] || 0) + 1;
    totalWeight += (b.weight || 0);
  });
  res.json({
    totalBookings: total,
    byStatus,
    totalWeightKg: totalWeight,
    activeShipments: (byStatus['In Transit'] || 0) + (byStatus['Customs Clearance'] || 0) + (byStatus['Out for Delivery'] || 0),
    delivered: byStatus['Delivered'] || 0,
    timestamp: new Date().toISOString(),
  });
});

// ── DATA EXPORT ─────────────────────────────────────────────

// GET /api/export/bookings.csv — download all bookings as CSV
app.get('/api/export/bookings.csv', (req, res) => {
  const bookings = readData('bookings.json');
  const headers = ['AWB', 'Route', 'Origin', 'Destination', 'Status', 'Date', 'Weight(kg)', 'Volume(CBM)', 'Commodity', 'Shipper', 'Consignee', 'Flight', 'Created'];
  const rows = bookings.map(b => [
    b.awb, b.route, b.origin, b.destination, b.status, b.date,
    b.weight, b.volume, b.commodity, `"${b.shipper}"`, `"${b.consignee}"`, b.flight, b.createdAt
  ].join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"');
  res.send(csv);
});

// ── 404 fallback ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✈  RwandAir Cargo · Local API Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  API:    http://localhost:${PORT}/api`);
  console.log(`  Data:   ${DATA_DIR}`);
  console.log('  Status: Running  ●');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});
