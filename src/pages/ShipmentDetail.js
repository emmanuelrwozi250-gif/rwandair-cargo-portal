import { useParams, Link, useNavigate } from 'react-router-dom';
import { useShipments } from '../context/ShipmentContext';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatDateShort, STATUSES, CARGO_TYPES } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';

const ShipmentDetail = () => {
  const { awb } = useParams();
  const { getByAWB, advanceStatus } = useShipments();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const shipment = getByAWB(awb);

  if (!shipment) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h3 className="empty-title">Shipment not found</h3>
        <p className="empty-desc">No shipment matches AWB <strong>{awb}</strong></p>
        <Link to="/shipments" className="btn btn-secondary">Back to My Shipments</Link>
      </div>
    );
  }

  const isOwner = shipment.userId === currentUser?.id;
  const currentStepIdx = STATUSES.indexOf(shipment.status);
  const cargoLabel = CARGO_TYPES.find((c) => c.value === shipment.cargo.type)?.label || shipment.cargo.type;
  const canAdvance = isOwner && shipment.status !== 'Delivered';

  return (
    <div style={{ maxWidth: 820 }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
          <div>
            <h1 className="page-title" style={{ fontFamily: 'monospace', letterSpacing: 1 }}>
              {shipment.awb}
            </h1>
            <p className="page-subtitle">Booked on {formatDateShort(shipment.createdAt)}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <StatusBadge status={shipment.status} />
          {canAdvance && (
            <button
              className="btn btn-outline-dark btn-sm"
              onClick={() => advanceStatus(shipment.awb)}
              title="Simulate status advancement (demo)"
            >
              Advance Status ›
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            {STATUSES.map((s, i) => (
              <div key={s} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', margin: '0 auto 6px',
                  background: i < currentStepIdx ? 'var(--success)' : i === currentStepIdx ? 'var(--primary)' : 'var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: i <= currentStepIdx ? '#fff' : 'var(--text-light)', fontWeight: 800,
                  boxShadow: i === currentStepIdx ? '0 0 0 4px rgba(27,58,107,0.15)' : 'none',
                  transition: 'all 0.3s',
                }}>
                  {i < currentStepIdx ? '✓' : i + 1}
                </div>
                <p style={{
                  fontSize: 11, lineHeight: 1.3,
                  color: i === currentStepIdx ? 'var(--primary)' : i < currentStepIdx ? 'var(--success)' : 'var(--text-light)',
                  fontWeight: i === currentStepIdx ? 700 : 400,
                }}>
                  {s}
                </p>
              </div>
            ))}
          </div>
          <div style={{ position: 'relative', height: 6, background: 'var(--border)', borderRadius: 999, marginTop: 8 }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 999,
              background: shipment.status === 'Delivered' ? 'var(--success)' : 'var(--primary)',
              width: `${(currentStepIdx / (STATUSES.length - 1)) * 100}%`,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Route */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Route</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)', fontFamily: 'monospace' }}>{shipment.origin.code}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{shipment.origin.city}</p>
                <p style={{ fontSize: 11, color: 'var(--text-light)' }}>{shipment.origin.country}</p>
              </div>
              <div style={{ flex: 1, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ height: 2, background: 'var(--border)', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', padding: '0 6px', fontSize: 16 }}>✈</span>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)', fontFamily: 'monospace' }}>{shipment.destination.code}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{shipment.destination.city}</p>
                <p style={{ fontSize: 11, color: 'var(--text-light)' }}>{shipment.destination.country}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cargo */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Cargo Details</h3>
          </div>
          <div className="card-body">
            <div className="detail-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="detail-item">
                <span className="detail-label">Type</span>
                <span className="detail-value">{cargoLabel}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Weight</span>
                <span className="detail-value">{shipment.cargo.weight} kg</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Pieces</span>
                <span className="detail-value">{shipment.cargo.pieces}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Rate</span>
                <span className="detail-value" style={{ color: 'var(--primary)', fontWeight: 800 }}>
                  USD {shipment.rate.toFixed(2)}
                </span>
              </div>
              {shipment.cargo.length > 0 && (
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                  <span className="detail-label">Dimensions</span>
                  <span className="detail-value">
                    {shipment.cargo.length} × {shipment.cargo.width} × {shipment.cargo.height} cm
                  </span>
                </div>
              )}
              {shipment.cargo.description && (
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                  <span className="detail-label">Description</span>
                  <span className="detail-value">{shipment.cargo.description}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Sender */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Sender</h3></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontWeight: 700 }}>{shipment.sender.name}</p>
              <p className="text-sm text-muted">{shipment.sender.phone}</p>
              <p className="text-sm text-muted">{shipment.sender.email}</p>
            </div>
          </div>
        </div>

        {/* Recipient */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Recipient</h3></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontWeight: 700 }}>{shipment.recipient.name}</p>
              <p className="text-sm text-muted">{shipment.recipient.phone}</p>
              <p className="text-sm text-muted">{shipment.recipient.email}</p>
              {shipment.recipient.address && (
                <p className="text-sm text-muted">{shipment.recipient.address}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Full Timeline</h3>
          <span className="text-sm text-muted">Last updated: {formatDate(shipment.updatedAt)}</span>
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
    </div>
  );
};

export default ShipmentDetail;
