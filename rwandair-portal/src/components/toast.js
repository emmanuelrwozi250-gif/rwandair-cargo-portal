// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Toast Notification System
// ═══════════════════════════════════════════════════════════════════

let _toastCounter = 0;

/**
 * Show a toast notification
 * @param {string} msg - Main message
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {string} [sub] - Optional subtitle/detail
 * @param {number} [duration=4000] - Auto-dismiss duration in ms (0 = persist)
 * @returns {number} Toast ID
 */
export function showToast(msg, type = 'info', sub = '', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const id = ++_toastCounter;
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  const icon = icons[type] || 'ℹ';

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.dataset.id = id;
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-body">
      <div class="toast-msg">${msg}</div>
      ${sub ? `<div class="toast-sub">${sub}</div>` : ''}
    </div>
    <button class="toast-close" onclick="(function(el){el.closest('.toast').classList.add('toast-exit');setTimeout(()=>el.closest('.toast')?.remove(),300);})(this)" aria-label="Dismiss">✕</button>
  `;

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => toast.classList.add('toast-show'));

  // Auto-dismiss
  if (duration > 0) {
    setTimeout(() => dismissToast(id), duration);
  }

  return id;
}

/**
 * Dismiss a toast by ID
 * @param {number} id
 */
export function dismissToast(id) {
  const toast = document.querySelector(`.toast[data-id="${id}"]`);
  if (!toast) return;
  toast.classList.add('toast-exit');
  setTimeout(() => toast.remove(), 300);
}

/**
 * Show a quick success toast
 */
export function toastSuccess(msg, sub) {
  return showToast(msg, 'success', sub, 3500);
}

/**
 * Show a quick error toast
 */
export function toastError(msg, sub) {
  return showToast(msg, 'error', sub, 6000);
}

/**
 * Show a quick warning toast
 */
export function toastWarning(msg, sub) {
  return showToast(msg, 'warning', sub, 5000);
}

// Make globally accessible for inline HTML handlers
window.showToast = showToast;
window.dismissToast = dismissToast;
