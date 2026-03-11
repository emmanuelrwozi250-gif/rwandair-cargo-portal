import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AIRPORTS, CARGO_TYPES, calculateRate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const REGION_RATES = { Africa: 2.5, Europe: 4.0, 'Middle East': 3.5, Asia: 5.0, Americas: 6.0 };

const RateCalculator = () => {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({
    originCode: 'KGL',
    destinationCode: '',
    weight: '',
    cargoType: 'general',
  });
  const [result, setResult] = useState(null);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setResult(null);
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!form.destinationCode || !form.weight) return;
    const rate = calculateRate(form.originCode, form.destinationCode, form.weight, form.cargoType);
    const dest = AIRPORTS.find((a) => a.code === form.destinationCode);
    const baseRate = REGION_RATES[dest?.region] || 3.0;
    const cargo = CARGO_TYPES.find((c) => c.value === form.cargoType);
    const w = Math.max(parseFloat(form.weight), 1);
    const base = baseRate * w * cargo.multiplier;
    const fuel = base * 0.15;
    const security = 0.25 * w;
    setResult({ total: rate, base: Math.round(base * 100) / 100, fuel: Math.round(fuel * 100) / 100, security: Math.round(security * 100) / 100, region: dest?.region, cargo: cargo.label, weight: w });
  };

  const origin = AIRPORTS.find((a) => a.code === form.originCode);
  const destination = AIRPORTS.find((a) => a.code === form.destinationCode);

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Rate Calculator</h1>
          <p className="page-subtitle">
            Estimate your cargo shipping cost. Final rates confirmed at booking.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleCalculate}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="label-required">Origin Airport</label>
                  <select value={form.originCode} onChange={(e) => set('originCode', e.target.value)}>
                    {AIRPORTS.map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.code} – {a.city}, {a.country}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label-required">Destination Airport</label>
                  <select value={form.destinationCode} onChange={(e) => set('destinationCode', e.target.value)}>
                    <option value="">— Select destination —</option>
                    {AIRPORTS.filter((a) => a.code !== form.originCode).map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.code} – {a.city}, {a.country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="label-required">Weight (kg)</label>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => set('weight', e.target.value)}
                    placeholder="e.g. 25"
                    min="0.1"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="label-required">Cargo Type</label>
                  <select value={form.cargoType} onChange={(e) => set('cargoType', e.target.value)}>
                    {CARGO_TYPES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-secondary btn-full btn-lg"
                disabled={!form.destinationCode || !form.weight}
              >
                Calculate Rate
              </button>
            </div>
          </form>

          {result && (
            <div className="rate-result">
              <p className="rate-label">Estimated Total</p>
              <p className="rate-amount">USD {result.total.toFixed(2)}</p>
              <p className="rate-label" style={{ marginTop: 4 }}>
                {origin?.city} ({origin?.code}) → {destination?.city} ({destination?.code}) · {result.weight} kg · {result.cargo}
              </p>

              <div className="rate-breakdown">
                <div className="rate-row">
                  <p className="rate-row-label">Base Freight</p>
                  <p className="rate-row-value">USD {result.base.toFixed(2)}</p>
                </div>
                <div className="rate-row">
                  <p className="rate-row-label">Fuel Surcharge (15%)</p>
                  <p className="rate-row-value">USD {result.fuel.toFixed(2)}</p>
                </div>
                <div className="rate-row">
                  <p className="rate-row-label">Security Surcharge</p>
                  <p className="rate-row-value">USD {result.security.toFixed(2)}</p>
                </div>
                <div className="rate-row">
                  <p className="rate-row-label">Destination Zone</p>
                  <p className="rate-row-value">{result.region}</p>
                </div>
              </div>

              <p style={{ fontSize: 12, opacity: 0.7, marginTop: 16 }}>
                * Rates are estimates only. Dangerous goods, pharma, and live animals may incur additional handling fees. All rates in USD.
              </p>

              {currentUser ? (
                <Link to="/book" style={{ display: 'inline-block', marginTop: 16, background: '#fff', color: 'var(--primary)', padding: '10px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14 }}>
                  Book This Shipment →
                </Link>
              ) : (
                <Link to="/register" style={{ display: 'inline-block', marginTop: 16, background: '#fff', color: 'var(--primary)', padding: '10px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14 }}>
                  Sign up to Book →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rate Info Table */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <h3 className="card-title">Base Rate Guide</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Destination Zone</th>
                  <th>Base Rate (USD/kg)</th>
                  <th>Example Destinations</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Africa</td><td className="font-bold">$2.50</td><td className="text-sm text-muted">Nairobi, Lagos, Johannesburg</td></tr>
                <tr><td>Middle East</td><td className="font-bold">$3.50</td><td className="text-sm text-muted">Dubai, Doha</td></tr>
                <tr><td>Europe</td><td className="font-bold">$4.00</td><td className="text-sm text-muted">London, Brussels, Paris</td></tr>
                <tr><td>Asia</td><td className="font-bold">$5.00</td><td className="text-sm text-muted">Mumbai, Guangzhou, Bangkok</td></tr>
                <tr><td>Americas</td><td className="font-bold">$6.00</td><td className="text-sm text-muted">New York, Washington D.C.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer">
          <p className="text-sm text-muted">
            All rates subject to 15% fuel surcharge + $0.25/kg security surcharge. Special cargo (pharma, dangerous goods, live animals) has additional multipliers. Contact{' '}
            <a href="mailto:cargo@rwandair.com" style={{ color: 'var(--primary-light)' }}>cargo@rwandair.com</a>{' '}
            for volume pricing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RateCalculator;
