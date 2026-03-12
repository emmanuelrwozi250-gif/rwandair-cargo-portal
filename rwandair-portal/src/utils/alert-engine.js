// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence — Automated Alert Engine
// Shipment lifecycle alerts with staggered setTimeout chains
// ═══════════════════════════════════════════════════════════════════

// ── Alert type definitions ──────────────────────────────────────
export const ALERT_TYPES = {
  UPLIFT: {
    icon: 'plane-out',
    severity: 'info',
    template: 'AWB {awb} uplifted on {flight} at {station}. Weight: {weight}kg.'
  },
  OFFLOAD: {
    icon: 'alert-triangle',
    severity: 'warning',
    template: 'AWB {awb} offloaded from {flight} at {station}. Reason: {reason}. Rebooking required.'
  },
  DELIVERY: {
    icon: 'check-circle',
    severity: 'info',
    template: 'AWB {awb} delivered at {destination}. Signed by {consignee}.'
  },
  DWELL_WARNING: {
    icon: 'clock',
    severity: 'warning',
    template: 'AWB {awb} at {station} approaching SLA. Dwell: {dwell}. Action needed.'
  },
  DWELL_CRITICAL: {
    icon: 'alert-circle',
    severity: 'critical',
    template: 'AWB {awb} BREACHED {sla}hr SLA at {station}. Current dwell: {dwell}.'
  },
  CUSTOMS_CLEARED: {
    icon: 'shield',
    severity: 'info',
    template: 'AWB {awb} cleared customs at {station}. Proceeding to delivery.'
  },
  TEMP_EXCURSION: {
    icon: 'alert-triangle',
    severity: 'critical',
    template: 'Temperature excursion AWB {awb} at {station}. Reading: {temp}\u00b0C.'
  }
};

// ── 18 alert scenarios with staggered delays ────────────────────
const ALERT_SCENARIOS = [
  {
    delay: 30000,
    type: 'UPLIFT',
    data: { awb: '459-64810293', flight: 'WB710', station: 'KGL', weight: 420 }
  },
  {
    delay: 75000,
    type: 'DWELL_WARNING',
    data: { awb: '459-64813401', station: 'NBO', dwell: '34hr 15min' }
  },
  {
    delay: 120000,
    type: 'OFFLOAD',
    data: { awb: '459-66281540', flight: 'WB700', station: 'NBO', reason: 'Capacity shortage — priority cargo loaded' }
  },
  {
    delay: 180000,
    type: 'DELIVERY',
    data: { awb: '459-64801122', destination: 'KGL', consignee: 'M. Habimana' }
  },
  {
    delay: 240000,
    type: 'CUSTOMS_CLEARED',
    data: { awb: '459-64815720', station: 'KGL' }
  },
  {
    delay: 310000,
    type: 'TEMP_EXCURSION',
    data: { awb: '459-66271704', station: 'DXB', temp: '12.4' }
  },
  {
    delay: 185000,
    type: 'UPLIFT',
    data: { awb: '459-64822017', flight: 'WB9316', station: 'DWC', weight: 1240 }
  },
  {
    delay: 220000,
    type: 'DWELL_CRITICAL',
    data: { awb: '459-64813401', station: 'NBO', sla: '36', dwell: '38hr 45min' }
  },
  {
    delay: 258000,
    type: 'OFFLOAD',
    data: { awb: '459-64830019', flight: 'WB622', station: 'LHR', reason: 'Flight cancelled — weather delay' }
  },
  {
    delay: 290000,
    type: 'UPLIFT',
    data: { awb: '459-64811455', flight: 'WB202', station: 'NBO', weight: 680 }
  },
  {
    delay: 325000,
    type: 'DELIVERY',
    data: { awb: '459-64802233', destination: 'NBO', consignee: 'S. Wanjiru' }
  },
  {
    delay: 365000,
    type: 'DWELL_WARNING',
    data: { awb: '459-64840055', station: 'DXB', dwell: '22hr 10min' }
  },
  {
    delay: 398000,
    type: 'CUSTOMS_CLEARED',
    data: { awb: '459-64822017', station: 'KGL' }
  },
  {
    delay: 435000,
    type: 'OFFLOAD',
    data: { awb: '459-64851203', flight: 'WB710', station: 'KGL', reason: 'DG irregularity — missing NOTOC' }
  },
  {
    delay: 470000,
    type: 'TEMP_EXCURSION',
    data: { awb: '459-66283099', station: 'NBO', temp: '28.7' }
  },
  {
    delay: 510000,
    type: 'UPLIFT',
    data: { awb: '459-64830019', flight: 'WB711', station: 'LHR', weight: 350 }
  },
  {
    delay: 545000,
    type: 'DWELL_CRITICAL',
    data: { awb: '459-64840055', station: 'DXB', sla: '24', dwell: '26hr 30min' }
  },
  {
    delay: 580000,
    type: 'DELIVERY',
    data: { awb: '459-64810293', destination: 'DXB', consignee: 'A. Al Rashid' }
  }
];

// ── Template interpolation ──────────────────────────────────────
function _fillTemplate(template, data) {
  return template.replace(/\{(\w+)\}/g, (_, key) => data[key] || key);
}

// ── Title from type ─────────────────────────────────────────────
function _titleFromType(type) {
  const titles = {
    UPLIFT: 'Cargo Uplifted',
    OFFLOAD: 'Offload Alert',
    DELIVERY: 'Delivery Confirmed',
    DWELL_WARNING: 'Dwell Warning',
    DWELL_CRITICAL: 'Dwell SLA Breach',
    CUSTOMS_CLEARED: 'Customs Cleared',
    TEMP_EXCURSION: 'Temperature Excursion'
  };
  return titles[type] || type;
}

// ── Link from type ──────────────────────────────────────────────
function _linkFromType(type) {
  const links = {
    UPLIFT: '#outbound',
    OFFLOAD: '#disruptions',
    DELIVERY: '#tracking',
    DWELL_WARNING: '#dwell-alerts',
    DWELL_CRITICAL: '#dwell-alerts',
    CUSTOMS_CLEARED: '#tracking',
    TEMP_EXCURSION: '#temperature'
  };
  return links[type] || '#dashboard';
}

// ── Process a single alert scenario ─────────────────────────────
function _fireAlert(scenario) {
  const alertDef = ALERT_TYPES[scenario.type];
  if (!alertDef) return;

  const message = _fillTemplate(alertDef.template, scenario.data);
  const title = _titleFromType(scenario.type);
  const severity = alertDef.severity;

  // Build notification object
  const notification = {
    id: Date.now() + Math.floor(Math.random() * 10000),
    type: scenario.type,
    title: title,
    message: message,
    time: new Date().toISOString(),
    read: false,
    station: scenario.data.station || scenario.data.destination || 'KGL',
    severity: severity,
    link: _linkFromType(scenario.type)
  };

  // 1. Dispatch cargo-alert CustomEvent
  document.dispatchEvent(new CustomEvent('cargo-alert', {
    detail: { type: scenario.type, notification: notification }
  }));

  // 2. Add to notification system if available
  if (typeof window.addCargoNotification === 'function') {
    window.addCargoNotification(notification);
  }

  // 3. Show toast (throttle: max 2 visible at once)
  if (typeof window.showToast === 'function') {
    const visibleToasts = document.querySelectorAll('.toast').length;
    if (visibleToasts < 2) {
      const toastType = severity === 'critical' ? 'error' : severity === 'warning' ? 'warning' : 'info';
      window.showToast(title, toastType, message, 5000);
    }
  }

  // 4. If OFFLOAD, also dispatch disruption event
  if (scenario.type === 'OFFLOAD') {
    const disruption = {
      id: 'DIS-' + Date.now(),
      awb: scenario.data.awb,
      originalFlight: scenario.data.flight,
      disruptionType: 'Offloaded',
      reason: scenario.data.reason,
      station: scenario.data.station,
      timestamp: new Date().toISOString(),
      status: 'New',
      priority: 'High',
      weight: scenario.data.weight || 0
    };

    document.dispatchEvent(new CustomEvent('cargo-disruption', {
      detail: disruption
    }));
  }
}

// ── Start the alert engine ──────────────────────────────────────
export function initAlertEngine() {
  const timers = [];

  ALERT_SCENARIOS.forEach(scenario => {
    const timer = setTimeout(() => {
      _fireAlert(scenario);
    }, scenario.delay);
    timers.push(timer);
  });

  // Return a cleanup function
  return function stopAlertEngine() {
    timers.forEach(t => clearTimeout(t));
    timers.length = 0;
  };
}
