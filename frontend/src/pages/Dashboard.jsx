import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data.courses)).catch(() => {});
    if (user.role === 'admin') {
      api.get('/reports/summary').then(r => setSummary(r.data.summary)).catch(() => {});
    }
  }, [user.role]);

  const totalStudents = summary.reduce((a, c) => a + parseInt(c.total_students || 0), 0);
  const totalSessions = summary.reduce((a, c) => a + parseInt(c.total_sessions || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user.name}</p>
        </div>
        <span className="badge badge-teal" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
          {user.role.toUpperCase()}
        </span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{courses.length}</div>
          <div className="stat-label">{user.role === 'student' ? 'My Courses' : 'Total Courses'}</div>
        </div>
        {user.role === 'admin' && (
          <>
            <div className="stat-card orange">
              <div className="stat-number">{totalStudents}</div>
              <div className="stat-label">Total Students</div>
            </div>
            <div className="stat-card purple">
              <div className="stat-number">{totalSessions}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-header"><h2>Quick Actions</h2></div>
        <div className="quick-grid">
          <Link to="/courses" className="quick-tile">
            <div className="tile-icon">📚</div>
            <div className="tile-label">Courses</div>
          </Link>
          {(user.role === 'teacher' || user.role === 'admin') && (
            <>
              <Link to="/sessions" className="quick-tile">
                <div className="tile-icon">📷</div>
                <div className="tile-label">Sessions</div>
              </Link>
              <Link to="/students" className="quick-tile">
                <div className="tile-icon">👥</div>
                <div className="tile-label">Students</div>
              </Link>
              <Link to="/reports" className="quick-tile">
                <div className="tile-icon">📊</div>
                <div className="tile-label">Reports</div>
              </Link>
            </>
          )}
        </div>
      </div>

      {user.role === 'admin' && summary.length > 0 && (
        <div className="card">
          <div className="card-header"><h2>Course Overview</h2></div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Code</th>
                  <th>Students</th>
                  <th>Sessions</th>
                </tr>
              </thead>
              <tbody>
                {summary.map(c => (
                  <tr key={c.course_id}>
                    <td style={{ fontWeight: 600 }}>{c.course_name}</td>
                    <td><span className="badge badge-teal">{c.course_code}</span></td>
                    <td>{c.total_students}</td>
                    <td>{c.total_sessions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {user.role === 'student' && (
        <div className="card">
          <div className="card-header"><h2>My Enrolled Courses</h2></div>
          {courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <p>You are not enrolled in any courses yet.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>Course Name</th><th>Code</th></tr></thead>
                <tbody>
                  {courses.map((c, i) => (
                    <tr key={c.id}>
                      <td>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td><span className="badge badge-teal">{c.code}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
