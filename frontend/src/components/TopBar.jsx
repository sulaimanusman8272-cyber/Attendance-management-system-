import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutModal from './LogoutModal';

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const ref = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-greeting">Good day, <strong>{user.name}</strong></span>
        </div>
        <div className="topbar-right" ref={ref}>
          <button className="topbar-user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div className="topbar-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="topbar-user-info">
              <span className="topbar-name">{user.name}</span>
              <span className="topbar-role">{user.role}</span>
            </div>
            <span className="topbar-chevron">{dropdownOpen ? '▲' : '▼'}</span>
          </button>

          {dropdownOpen && (
            <div className="topbar-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="dropdown-name">{user.name}</p>
                  <p className="dropdown-email">{user.email}</p>
                  <span className="badge badge-teal" style={{ fontSize: '0.68rem' }}>{user.role}</span>
                </div>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-item dropdown-logout" onClick={() => { setDropdownOpen(false); setShowLogout(true); }}>
                <span>↩</span> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {showLogout && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </>
  );
}
