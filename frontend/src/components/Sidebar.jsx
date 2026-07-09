import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard',  roles: ['admin','teacher','student'] },
  { to: '/courses',   icon: '◫', label: 'Courses',    roles: ['admin','teacher','student'] },
  { to: '/sessions',  icon: '◉', label: 'Sessions',   roles: ['admin','teacher'] },
  { to: '/students',  icon: '◎', label: 'Users',      roles: ['admin','teacher'] },
  { to: '/reports',   icon: '◈', label: 'Reports',    roles: ['admin','teacher'] },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  if (!user) return null;

  const allowed = navItems.filter(n => n.roles.includes(user.role));

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>Attendance<br/>Management</h2>
            <span>System</span>
          </div>
          {/* Close button — mobile only */}
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
            fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1,
            display: 'block'
          }}>×</button>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Main Menu</div>
        {allowed.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom-brand">
        <p>AMS v1.0</p>
      </div>
    </aside>
  );
}
