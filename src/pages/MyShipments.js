import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShipments } from '../context/ShipmentContext';
import { formatDateShort, STATUSES } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';

const ALL_TABS = ['All', ...STATUSES];

const MyShipments = () => {
  const { currentUser } = useAuth();
  const { getByUser } = useShipments();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const shipments = getByUser(currentUser.id);

  const filtered = shipments
    .filter((s) => activeTab === 'All' || s.status === activeTab)
    .filter((s) => {
      const q = search.toLowerCase();
      if (!q) return true;
      return (
        s.awb.toLowerCase().includes(q) ||
        s.origin.city.toLowerCase().includes(q) ||
        s.destination.city.toLowerCase().includes(q) ||
        s.cargo.type.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const tabCounts = {};
  ALL_TABS.forEach((t) => {
    tabCounts[t] = t === 'All' ? shipments.length : shipments.filter((s) => s.status === t).length;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Shipments</h1>
          <p className="page-subtitle">{shipments.length} total shipment{shipments.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/book" className="btn btn-primary">+ Book New</Link>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="tabs" style={{ margin: 0, flexWrap: 'wrap' }}>
          {ALL_TABS.map((t) => (
            <button
              key={t}
              className={`tab${activeTab === t ? ' tab-active' : ''}`}
              onClick={() => handleTabChange(t)}
            >
              {t} {tabCounts[t] > 0 && (
                <span style={{
                  background: activeTab === t ? 'var(--primary)' : '#E5E7EB',
                  color: activeTab === t ? '#fff' : 'var(--text-muted)',
                  fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 999, marginLeft: 4,
                }}>
                  {tabCounts[t]}
                </span>
              )}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search AWB, city, type…"
            style={{ width: 220, fontSize: 13 }}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {paginated.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3 className="empty-title">
                {shipments.length === 0 ? 'No shipments yet' : 'No results found'}
              </h3>
              <p className="empty-desc">
                {shipments.length === 0
                  ? 'Book your first shipment to see it here.'
                  : 'Try adjusting your filter or search query.'}
              </p>
              {shipments.length === 0 && (
                <Link to="/book" className="btn btn-primary">Book a Shipment</Link>
              )}
            </div>
          ) : (
            <>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>AWB</th>
                      <th>Origin</th>
                      <th>Destination</th>
                      <th>Type</th>
                      <th>Weight</th>
                      <th>Rate (USD)</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((s) => (
                      <tr key={s.awb}>
                        <td>
                          <Link to={`/shipments/${s.awb}`} className="table-link">{s.awb}</Link>
                        </td>
                        <td>
                          <span className="font-bold">{s.origin.code}</span>
                          <br />
                          <span className="text-sm text-muted">{s.origin.city}</span>
                        </td>
                        <td>
                          <span className="font-bold">{s.destination.code}</span>
                          <br />
                          <span className="text-sm text-muted">{s.destination.city}</span>
                        </td>
                        <td className="text-sm" style={{ textTransform: 'capitalize' }}>{s.cargo.type}</td>
                        <td className="text-sm">{s.cargo.weight} kg</td>
                        <td className="text-sm font-bold">{s.rate.toFixed(2)}</td>
                        <td><StatusBadge status={s.status} /></td>
                        <td className="text-sm text-muted">{formatDateShort(s.createdAt)}</td>
                        <td>
                          <Link to={`/shipments/${s.awb}`} className="btn btn-ghost btn-sm">View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
                  <button
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ← Prev
                  </button>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyShipments;
