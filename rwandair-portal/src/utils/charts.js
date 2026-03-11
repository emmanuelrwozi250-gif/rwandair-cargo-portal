// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Chart.js Helper Utilities
// Lazy chart initialisation with destroy-before-recreate pattern
// ═══════════════════════════════════════════════════════════════════

const _charts = {};

/**
 * Destroy an existing chart by canvas ID
 * @param {string} id - Canvas element ID
 */
export function destroyChart(id) {
  if (_charts[id]) {
    _charts[id].destroy();
    delete _charts[id];
  }
}

/**
 * Create a line chart
 * @param {string} id - Canvas ID
 * @param {string[]} labels
 * @param {Object[]} datasets - Chart.js dataset objects
 * @param {Object} opts - Additional Chart.js options
 */
export function lineChart(id, labels, datasets, opts = {}) {
  destroyChart(id);
  const ctx = document.getElementById(id);
  if (!ctx) return;
  _charts[id] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map(d => ({ ...d, tension: 0.4, pointRadius: 3 }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: !!opts.legend } },
      scales: {
        y: {
          ticks: { callback: v => '$' + v.toLocaleString() },
          grid: { color: 'rgba(0,0,0,.04)' }
        },
        x: { grid: { display: false } }
      },
      ...opts
    }
  });
  return _charts[id];
}

/**
 * Create a bar chart
 * @param {string} id - Canvas ID
 * @param {string[]} labels
 * @param {Object[]} datasets
 * @param {Object} opts
 */
export function barChart(id, labels, datasets, opts = {}) {
  destroyChart(id);
  const ctx = document.getElementById(id);
  if (!ctx) return;
  _charts[id] = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: !!opts.legend } },
      scales: {
        y: { grid: { color: 'rgba(0,0,0,.04)' } },
        x: { grid: { display: false } }
      },
      ...opts
    }
  });
  return _charts[id];
}

/**
 * Create a doughnut chart
 * @param {string} id - Canvas ID
 * @param {string[]} labels
 * @param {number[]} data
 * @param {string[]} colors
 */
export function doughnutChart(id, labels, data, colors) {
  destroyChart(id);
  const ctx = document.getElementById(id);
  if (!ctx) return;
  _charts[id] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderWidth: 2 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'right' } },
      cutout: '60%'
    }
  });
  return _charts[id];
}

/**
 * Create a mini sparkline chart (no axes, no labels)
 * @param {string} id - Canvas ID
 * @param {number[]} data
 * @param {string} color - CSS colour string
 */
export function sparkline(id, data, color = '#00529B') {
  destroyChart(id);
  const ctx = document.getElementById(id);
  if (!ctx) return;
  _charts[id] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [{
        data,
        borderColor: color,
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.4,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
      elements: { line: { borderCapStyle: 'round' } }
    }
  });
  return _charts[id];
}

/**
 * Create a scatter chart
 * @param {string} id - Canvas ID
 * @param {Object[]} datasets
 * @param {Object} opts
 */
export function scatterChart(id, datasets, opts = {}) {
  destroyChart(id);
  const ctx = document.getElementById(id);
  if (!ctx) return;
  _charts[id] = new Chart(ctx, {
    type: 'scatter',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      ...opts
    }
  });
  return _charts[id];
}

// ── Aliases (named exports used by page modules) ─────────────────
export const buildBarChart   = barChart;
export const buildLineChart  = lineChart;
export const buildDoughnut   = doughnutChart;
export const buildSparkline  = sparkline;

/**
 * Create an arc/gauge chart using doughnut half
 * @param {string} id - Canvas ID
 * @param {number} value - 0–100 percentage
 * @param {string} color - Fill colour
 */
export function gaugeChart(id, value, color = '#00529B') {
  destroyChart(id);
  const ctx = document.getElementById(id);
  if (!ctx) return;
  _charts[id] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [value, 100 - value],
        backgroundColor: [color, 'rgba(0,0,0,.06)'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      circumference: 180,
      rotation: -90,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      cutout: '75%'
    }
  });
  return _charts[id];
}
