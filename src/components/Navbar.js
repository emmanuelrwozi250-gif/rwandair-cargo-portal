import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoBlue from '../logo-blue.png';

const Navbar = ({ onToggleSidebar }) => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <span />
          <span />
          <span />
        </button>
        <Link to="/" className="navbar-brand">
          <img src={logoBlue} alt="RwandAir Cargo" className="navbar-logo" />
        </Link>
      </div>

      <nav className="navbar-right">
        <Link to="/track" className="nav-link">Track Shipment</Link>
        <Link to="/rates" className="nav-link">Rate Calculator</Link>
        {currentUser ? (
          <div className="user-menu">
            <div className="user-avatar">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser.name}</span>
              {currentUser.company && (
                <span className="user-company">{currentUser.company}</span>
              )}
            </div>
            <button onClick={logout} className="btn btn-outline btn-sm">
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
