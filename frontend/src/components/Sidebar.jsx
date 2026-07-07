import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard',  roles: ['admin','teacher','student'] },
  { to: '/courses',   icon: '◫', label: 'Courses',    roles: ['admin','teacher','student'] },
  { to: '/sessions',  icon: '◉', label: 'Sessions',   roles: ['admin','teacher'] },
  { to: '/students',  icon: '◎', label: 'Students',   roles: ['admin','teacher'] },
  { to: '/reports',   icon: '◈', label: 'Reports',    roles: ['admin','teacher'] },
];

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const allowed = navItems.filter(n => n.roles.includes(user.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>Attendance<br/>Management</h2>
        <span>System</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Main Menu</div>
        {allowed.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
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
