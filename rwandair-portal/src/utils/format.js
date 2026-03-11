// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Formatting Utilities
// ═══════════════════════════════════════════════════════════════════

const _prefs = window._prefs || {};

/**
 * Format a number according to type
 * @param {number} n
 * @param {'number'|'currency'|'weight'|'yield'|'pct'} type
 */
export function formatNumber(n, type = 'number') {
  if (n === null || n === undefined) return '—';
  if (type === 'currency') return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (type === 'weight') return _prefs.weightUnit === 'lbs' ? (n * 2.20462).toFixed(0) + ' lbs' : n.toLocaleString('en-US') + ' kg';
  if (type === 'yield') return '$' + n.toFixed(2) + '/kg';
  if (type === 'pct') return n.toFixed(1) + '%';
  return n.toLocaleString('en-US');
}

/**
 * Format a date
 * @param {string|Date} d
 * @param {'short'|'time'|'datetime'|'rel'} fmt
 */
export function formatDate(d, fmt = 'short') {
  if (!d) return '—';
  const dt = d instanceof Date ? d : new Date(d);
  if (fmt === 'short') return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  if (fmt === 'time') return dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (fmt === 'datetime') return formatDate(dt, 'short') + ' ' + formatDate(dt, 'time');
  if (fmt === 'rel') {
    const diff = Date.now() - dt.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'hr ago';
    return Math.floor(diff / 86400000) + 'd ago';
  }
  return dt.toLocaleDateString();
}

/**
 * Format an AWB number with dash notation
 * @param {string} awb
 */
export function formatAWB(awb) {
  if (!awb) return '—';
  const s = String(awb).replace(/\D/g, '');
  if (s.length >= 11) return s.slice(0, 3) + '-' + s.slice(3);
  return awb;
}

/**
 * Format dwell time in minutes as coloured HTML span
 * @param {number} minutes
 */
export function formatDwell(minutes) {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  const color = minutes > 2880 ? 'var(--red)' : minutes > 2160 ? 'var(--amber)' : 'var(--green)';
  return `<span style="color:${color};font-weight:700">${h}hr ${m}min</span>`;
}

/**
 * Return RAG CSS class string based on percentage
 * @param {number} pct
 */
export function ragClass(pct) {
  return pct >= 95 ? 'rag-green' : pct >= 75 ? 'rag-amber' : 'rag-red';
}

/**
 * Sanitize a string for safe innerHTML insertion
 * @param {string} str
 */
export function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Debounce a function
 * @param {Function} fn
 * @param {number} ms
 */
export function debounce(fn, ms = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
