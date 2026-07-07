import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: '', code: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [loading, setLoading] = useState(false);

  const fetchCourses = () => {
    api.get('/courses').then(r => setCourses(r.data.courses)).catch(() => {});
  };

  useEffect(() => { fetchCourses(); }, []);

  const notify = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setError(''); setMessage(''); }, 4000);
  };

  const handleCreate = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return notify('Both fields are required.', true);
    setLoading(true);
    try {
      await api.post('/courses', form);
      notify('Course created successfully.');
      setForm({ name: '', code: '' });
      fetchCourses();
      setActiveTab('list');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to create course.', true);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Courses</h1>
          <p>Manage academic courses and enrollments</p>
        </div>
        {(user.role === 'teacher' || user.role === 'admin') && (
          <button className="btn btn-primary" onClick={() => setActiveTab('create')}>
            + New Course
          </button>
        )}
      </div>

      {message && <div className="alert alert-success">✓ {message}</div>}
      {error   && <div className="alert alert-error">⚠ {error}</div>}

      <div className="tabs">
        <div className={`tab ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
          All Courses ({courses.length})
        </div>
        {(user.role === 'teacher' || user.role === 'admin') && (
          <div className={`tab ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
            Create Course
          </div>
        )}
      </div>

      {activeTab === 'list' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Course Name</th>
                  <th>Code</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c, i) => (
                  <tr key={c.id}>
                    <td style={{ color: '#90a4ae' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td><span className="badge badge-teal">{c.code}</span></td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td colSpan="3">
                      <div className="empty-state">
                        <div className="empty-icon">📚</div>
                        <p>No courses found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'create' && (user.role === 'teacher' || user.role === 'admin') && (
        <div className="card" style={{ maxWidth: 500 }}>
          <div className="card-header"><h2>Create New Course</h2></div>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Course Name</label>
              <input
                type="text"
                placeholder="e.g. Data Structures"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Course Code</label>
              <input
                type="text"
                placeholder="e.g. CS301"
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Course'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setActiveTab('list')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
