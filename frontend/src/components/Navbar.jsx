import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <h1>Attendance Management System</h1>
      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/courses">Courses</Link>
        {(user.role === 'teacher' || user.role === 'admin') && (
          <Link to="/sessions">Sessions</Link>
        )}
        <Link to="/reports">Reports</Link>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
          {user.name} ({user.role})
        </span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
