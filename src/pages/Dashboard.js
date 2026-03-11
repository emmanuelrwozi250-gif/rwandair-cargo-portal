import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShipments } from '../context/ShipmentContext';
import { formatDateShort } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { getByUser } = useShipments();
  const shipments = getByUser(currentUser.id);

  const total = shipments.length;
  const inTransit = shipments.filter((s) => s.status === 'In Transit').length;
  const delivered = shipments.filter((s) => s.status === 'Delivered').length;
  const booked = shipments.filter((s) => s.status === 'Booked').length;

  const recent = [...shipments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Welcome back, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="page-subtitle">
            Here's an overview of your cargo activity.
          </p>
        </div>
        <Link to="/book" className="btn btn-primary">
          + Book New Shipment
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Shipments</span>
          <span className="stat-value">{total}</span>
          <span className="stat-sub">All time</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">In Transit</span>
          <span className="stat-value warning">{inTransit}</span>
          <span className="stat-sub">Currently flying</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Delivered</span>
          <span className="stat-value success">{delivered}</span>
          <span className="stat-sub">Completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Awaiting Collection</span>
          <span className="stat-value accent">{booked}</span>
          <span className="stat-sub">Pending pickup</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Shipments</h2>
          {total > 0 && (
            <Link to="/shipments" className="btn btn-ghost btn-sm">
              View all →
            </Link>
          )}
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {recent.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✈</div>
              <h3 className="empty-title">No shipments yet</h3>
              <p className="empty-desc">
                Book your first cargo shipment to get started.
              </p>
              <Link to="/book" className="btn btn-primary">
                Book a Shipment
              </Link>
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>AWB Number</th>
                    <th>Origin → Destination</th>
                    <th>Cargo</th>
                    <th>Weight</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((s) => (
                    <tr key={s.awb}>
                      <td>
                        <Link to={`/shipments/${s.awb}`} className="table-link">
                          {s.awb}
                        </Link>
                      </td>
                      <td>
                        <span className="font-bold">{s.origin.code}</span>
                        <span className="text-muted"> → </span>
                        <span className="font-bold">{s.destination.code}</span>
                      </td>
                      <td className="text-sm text-muted" style={{ textTransform: 'capitalize' }}>
                        {s.cargo.type}
                      </td>
                      <td className="text-sm">{s.cargo.weight} kg</td>
                      <td>
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="text-sm text-muted">{formatDateShort(s.createdAt)}</td>
                      <td>
                        <Link to={`/shipments/${s.awb}`} className="btn btn-ghost btn-sm">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 24, padding: '16px 20px', background: '#EBF0F9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 2 }}>
            Need help with your shipment?
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Contact our cargo team at{' '}
            <a href="mailto:cargo@rwandair.com" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
              cargo@rwandair.com
            </a>{' '}
            or call{' '}
            <a href="tel:+250738306074" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
              +250 738 306 074
            </a>
          </p>
        </div>
        <Link to="/track" className="btn btn-outline-dark btn-sm">
          Track a Shipment
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
