// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence Portal — Bookings Page
// ═══════════════════════════════════════════════════════════════════

import { BOOKINGS_DATA } from '../data/bookings.js';
import { formatNumber, formatDate, esc, debounce } from '../utils/format.js';
import { showToast } from '../components/toast.js';
import { openBookingModal } from '../components/modals.js';

// Re-export the my-bookings handler since bookings.js IS the bookings page
export { handler } from './my-bookings.js';
