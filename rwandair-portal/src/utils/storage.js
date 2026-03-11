// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — In-Memory State Store + Preferences
// All state persists for the session (no localStorage in this build)
// ═══════════════════════════════════════════════════════════════════

// Initialise global state objects (idempotent)
window._prefs = window._prefs || { timeFormat: '24', weightUnit: 'kg', currency: 'USD' };
window._quotes = window._quotes || [];
window._checklist = window._checklist || {};
window._bookingDraft = window._bookingDraft || null;
window._notifState = window._notifState || { unread: 0, items: [] };

/** Exported references */
export const prefs = window._prefs;
export const quotes = window._quotes;

// ── Quote management ─────────────────────────────────────────────

/**
 * Save a rate quote to session storage
 * @param {Object} q - Quote object
 */
export function saveQuote(q) {
  window._quotes.unshift({ ...q, id: Date.now(), savedAt: new Date().toISOString() });
}

/** Get all saved quotes */
export function getQuotes() {
  return window._quotes;
}

// ── Pre-departure checklist ───────────────────────────────────────

/**
 * Set a checklist item for a flight
 * @param {string} flightId
 * @param {string} item
 * @param {boolean} checked
 */
export function setChecklist(flightId, item, checked) {
  if (!window._checklist[flightId]) window._checklist[flightId] = {};
  window._checklist[flightId][item] = checked;
}

/**
 * Get all checklist items for a flight
 * @param {string} flightId
 */
export function getChecklist(flightId) {
  return window._checklist[flightId] || {};
}

// ── Preferences ───────────────────────────────────────────────────

/**
 * Set a user preference
 * @param {string} key
 * @param {*} value
 */
export function setPref(key, value) {
  window._prefs[key] = value;
  document.dispatchEvent(new CustomEvent('pref-change', { detail: { key, value } }));
}

/**
 * Get a user preference
 * @param {string} key
 */
export function getPref(key) {
  return window._prefs[key];
}

// ── Booking draft ─────────────────────────────────────────────────

/** Save booking draft */
export function setBookingDraft(draft) {
  window._bookingDraft = draft;
}

/** Get booking draft */
export function getBookingDraft() {
  return window._bookingDraft;
}

/** Clear booking draft */
export function clearBookingDraft() {
  window._bookingDraft = null;
}
