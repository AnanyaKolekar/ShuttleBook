import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const initial = user?.name?.[0]?.toUpperCase() || '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="brand" onClick={() => navigate('/')}>
        ShuttleBook
      </div>
      {user && (
        <nav className="navlinks">
          <NavLink to="/" end>
            Booking
          </NavLink>
          <NavLink to="/history">History</NavLink>
          {user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        </nav>
      )}
      {user && (
        <div className="avatar-wrapper" onClick={() => setOpen((s) => !s)}>
          <div className="avatar">{initial}</div>
          {open && (
            <div className="dropdown">
              <button onClick={() => navigate('/settings')} disabled>
                Settings (soon)
              </button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;

