import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '▦', authRequired: true },
  { to: '/book', label: 'Book Shipment', icon: '✚', authRequired: true },
  { to: '/shipments', label: 'My Shipments', icon: '◫', authRequired: true },
  { to: '/track', label: 'Track Shipment', icon: '◎', authRequired: false },
  { to: '/rates', label: 'Rate Calculator', icon: '≋', authRequired: false },
];

const Sidebar = ({ isOpen }) => {
  const { currentUser } = useAuth();

  return (
    <aside className={`sidebar${isOpen ? ' sidebar-open' : ''}`}>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          if (item.authRequired && !currentUser) return null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' sidebar-link-active' : ''}`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-contact">
          <p className="contact-label">Cargo Support</p>
          <a href="mailto:cargo@rwandair.com" className="contact-link">
            cargo@rwandair.com
          </a>
          <a href="tel:+250738306074" className="contact-link">
            +250 738 306 074
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
