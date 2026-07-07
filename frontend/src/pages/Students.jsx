import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CustomSelect from '../components/CustomSelect';

export default function Students() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('list');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '' });
  const [enrollForm, setEnrollForm] = useState({ student_id: '', course_id: '' });

  const notify = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setError(''); setMessage(''); }, 4000);
  };

  const fetchAll = () => {
    api.get('/courses').then(r => setCourses(r.data.courses)).catch(() => {});
    api.get('/users/students').then(r => setStudents(r.data.students)).catch(() => {});
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRegister = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        ...regForm,
        role: 'student',
        institution_id: user.institution_id,
      });
      notify(`Student "${res.data.user.name}" registered successfully.`);
      setRegForm({ name: '', email: '', password: '' });
      fetchAll();
      setActiveTab('list');
    } catch (err) {
      notify(err.response?.data?.message || 'Registration failed.', true);
    } finally { setLoading(false); }
  };

  const handleEnroll = async e => {
    e.preventDefault();
    if (!enrollForm.student_id || !enrollForm.course_id) return notify('Select both student and course.', true);
    setLoading(true);
    try {
      await api.post('/courses/enroll', {
        student_id: parseInt(enrollForm.student_id),
        course_id: parseInt(enrollForm.course_id),
      });
      notify('Student enrolled successfully.');
      setEnrollForm({ student_id: '', course_id: '' });
    } catch (err) {
      notify(err.response?.data?.message || 'Enrollment failed.', true);
    } finally { setLoading(false); }
  };

  const studentOptions = students.map(s => ({ value: s.id, label: `${s.name} (${s.email})` }));
  const courseOptions  = courses.map(c  => ({ value: c.id, label: `${c.name} (${c.code})` }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>Register students and manage course enrollments</p>
        </div>
        {user.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setActiveTab('register')}>+ Add Student</button>
        )}
      </div>

      {message && <div className="alert alert-success">✓ {message}</div>}
      {error   && <div className="alert alert-error">⚠ {error}</div>}

      <div className="tabs">
        <div className={`tab ${activeTab==='list'?'active':''}`} onClick={() => setActiveTab('list')}>
          Student List ({students.length})
        </div>
        <div className={`tab ${activeTab==='enroll'?'active':''}`} onClick={() => setActiveTab('enroll')}>
          Enroll in Course
        </div>
        {user.role === 'admin' && (
          <div className={`tab ${activeTab==='register'?'active':''}`} onClick={() => setActiveTab('register')}>
            Register Student
          </div>
        )}
      </div>

      {activeTab === 'list' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>ID</th></tr></thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color: '#90a4ae' }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width:32,height:32,borderRadius:'50%',background:'#e0f2f1',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#00796b',fontSize:13 }}>
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#78909c' }}>{s.email}</td>
                    <td><span className="badge badge-teal">ID: {s.id}</span></td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan="4"><div className="empty-state"><div className="empty-icon">👥</div><p>No students registered yet.</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'enroll' && (
        <div className="card" style={{ maxWidth: 500 }}>
          <div className="card-header"><h2>Enroll Student in Course</h2></div>
          <form onSubmit={handleEnroll}>
            <div className="form-group">
              <label>Select Student</label>
              <CustomSelect
                value={enrollForm.student_id}
                onChange={e => setEnrollForm({ ...enrollForm, student_id: e.target.value })}
                options={studentOptions}
                placeholder="-- Choose a student --"
              />
            </div>
            <div className="form-group">
              <label>Select Course</label>
              <CustomSelect
                value={enrollForm.course_id}
                onChange={e => setEnrollForm({ ...enrollForm, course_id: e.target.value })}
                options={courseOptions}
                placeholder="-- Choose a course --"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enrolling...' : 'Enroll Student'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'register' && user.role === 'admin' && (
        <div className="card" style={{ maxWidth: 500 }}>
          <div className="card-header"><h2>Register New Student</h2></div>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Student full name" value={regForm.name}
                onChange={e => setRegForm({ ...regForm, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="student@university.edu" value={regForm.email}
                onChange={e => setRegForm({ ...regForm, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Admin@123" value={regForm.password}
                onChange={e => setRegForm({ ...regForm, password: e.target.value })} required minLength={6} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Registering...' : 'Register Student'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setActiveTab('list')}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
