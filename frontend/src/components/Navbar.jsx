import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, List, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <div className="navbar-logo">Z</div>
          <span className="navbar-title">Zepnest</span>
        </NavLink>

        <div className="navbar-nav">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={14} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                Dashboard
              </NavLink>
              <NavLink
                to="/requests"
                className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
              >
                <List size={14} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                My Requests
              </NavLink>
              <NavLink
                to="/requests/new"
                className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
              >
                <PlusCircle size={14} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                New Request
              </NavLink>

              <div className="navbar-user" style={{ marginLeft: '12px' }}>
                <div className="user-avatar" title={user?.fullName}>{initials}</div>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn"
                  style={{ color: 'var(--color-text-dim)' }}>
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <NavLink to="/auth" className="btn btn-primary btn-sm" id="nav-login-btn">
              Get Started
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
