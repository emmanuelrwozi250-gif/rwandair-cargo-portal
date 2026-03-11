import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShipments } from '../context/ShipmentContext';
import { formatDate, STATUSES } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';

const TrackShipment = () => {
  const { getByAWB } = useShipments();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [shipment, setShipment] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;
    const found = getByAWB(trimmed);
    setShipment(found || null);
    setSearched(true);
  };

  const currentStepIdx = shipment ? STATUSES.indexOf(shipment.status) : -1;

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Track Shipment</h1>
          <p className="page-subtitle">
            Enter your Air Waybill (AWB) number to track your cargo.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter AWB number (e.g. WB-12345678)"
                style={{ flex: 1, fontFamily: 'monospace', fontSize: 15 }}
                autoFocus
              />
              <button type="submit" className="btn btn-secondary" style={{ flexShrink: 0 }}>
                Track
              </button>
            </div>
          </form>
        </div>
      </div>

      {searched && !shipment && (
        <div className="alert alert-error">
          No shipment found for AWB <strong>{query.trim().toUpperCase()}</strong>. Please check the number and try again.
        </div>
      )}

      {shipment && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header */}
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <p className="detail-label">AWB Number</p>
                  <p style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, color: 'var(--primary)', letterSpacing: 1 }}>
                    {shipment.awb}
                  </p>
                </div>
                <StatusBadge status={shipment.status} />
              </div>

              <div className="divider" />

              {/* Progress Bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  {STATUSES.map((s, i) => (
                    <div key={s} style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', margin: '0 auto 4px',
                        background: i <= currentStepIdx ? (i === currentStepIdx ? 'var(--primary)' : 'var(--success)') : 'var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: '#fff', fontWeight: 700,
                      }}>
                        {i < currentStepIdx ? '✓' : i === currentStepIdx ? '●' : ''}
                      </div>
                      <p style={{ fontSize: 10, color: i <= currentStepIdx ? 'var(--text)' : 'var(--text-light)', fontWeight: i === currentStepIdx ? 700 : 400, lineHeight: 1.2 }}>
                        {s}
                      </p>
                    </div>
                  ))}
                </div>
                <div style={{ position: 'relative', height: 6, background: 'var(--border)', borderRadius: 999 }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 999,
                    background: 'var(--success)',
                    width: `${(currentStepIdx / (STATUSES.length - 1)) * 100}%`,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Origin</span>
                  <span className="detail-value">{shipment.origin.code} — {shipment.origin.city}</span>
                  <span className="detail-value text-muted text-sm">{shipment.origin.country}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Destination</span>
                  <span className="detail-value">{shipment.destination.code} — {shipment.destination.city}</span>
                  <span className="detail-value text-muted text-sm">{shipment.destination.country}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Cargo</span>
                  <span className="detail-value" style={{ textTransform: 'capitalize' }}>{shipment.cargo.type}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Weight</span>
                  <span className="detail-value">{shipment.cargo.weight} kg · {shipment.cargo.pieces} pcs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Shipment Timeline</h3>
            </div>
            <div className="card-body">
              <ul className="timeline">
                {[...shipment.timeline].reverse().map((event, i) => (
                  <li key={i} className="timeline-item">
                    <div className={`timeline-dot ${i === 0 ? 'timeline-dot-active' : 'timeline-dot-done'}`} />
                    <p className="timeline-status">{event.status}</p>
                    <p className="timeline-meta">{formatDate(event.timestamp)} · {event.location}</p>
                    {event.note && <p className="timeline-note">{event.note}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to={`/shipments/${shipment.awb}`} className="btn btn-outline-dark">
              View Full Shipment Details
            </Link>
          </div>
        </div>
      )}

      {!searched && (
        <div className="card">
          <div className="card-body" style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>How to find your AWB number</p>
            <p>Your Air Waybill number starts with <strong>WB-</strong> followed by 8 digits (e.g. <span style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>WB-12345678</span>).</p>
            <p style={{ marginTop: 8 }}>You can find it in your booking confirmation email or by logging in to your account under <strong>My Shipments</strong>.</p>
            <p style={{ marginTop: 12 }}>Need help? Contact us at <a href="mailto:cargo@rwandair.com" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>cargo@rwandair.com</a></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackShipment;
