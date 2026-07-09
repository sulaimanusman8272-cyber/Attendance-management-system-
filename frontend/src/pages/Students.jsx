import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CustomSelect from '../components/CustomSelect';

export default function Students() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [activeTab, setActiveTab] = useState('students');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [enrollForm, setEnrollForm] = useState({ student_id: '', course_id: '' });

  const notify = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setError(''); setMessage(''); }, 4000);
  };

  const fetchAll = () => {
    api.get('/courses').then(r => setCourses(r.data.courses)).catch(() => {});
    api.get('/users/students').then(r => setStudents(r.data.students)).catch(() => {});
    if (user.role === 'admin') {
      api.get('/users/teachers').then(r => setTeachers(r.data.teachers)).catch(() => {});
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRegister = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        ...regForm,
        institution_id: user.institution_id,
      });
      notify(`${regForm.role === 'teacher' ? 'Teacher' : 'Student'} "${res.data.user.name}" registered successfully.`);
      setRegForm({ name: '', email: '', password: '', role: regForm.role });
      fetchAll();
      setActiveTab(regForm.role === 'teacher' ? 'teachers' : 'students');
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

  const renderUserTable = (list, emptyMsg) => (
    <div className="card">
      <div className="table-wrapper">
        <table>
          <thead><tr><th>#</th><th>Name</th><th>Email</th><th>ID</th></tr></thead>
          <tbody>
            {list.map((s, i) => (
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
            {list.length === 0 && (
              <tr><td colSpan="4"><div className="empty-state"><div className="empty-icon">👥</div><p>{emptyMsg}</p></div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>Manage students and teachers</p>
        </div>
        {user.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setActiveTab('register')}>+ Add User</button>
        )}
      </div>

      {message && <div className="alert alert-success">✓ {message}</div>}
      {error   && <div className="alert alert-error">⚠ {error}</div>}

      <div className="tabs">
        <div className={`tab ${activeTab==='students'?'active':''}`} onClick={() => setActiveTab('students')}>
          Students ({students.length})
        </div>
        {user.role === 'admin' && (
          <div className={`tab ${activeTab==='teachers'?'active':''}`} onClick={() => setActiveTab('teachers')}>
            Teachers ({teachers.length})
          </div>
        )}
        {user.role === 'admin' && (
          <div className={`tab ${activeTab==='enroll'?'active':''}`} onClick={() => setActiveTab('enroll')}>
            Enroll in Course
          </div>
        )}
        {user.role === 'admin' && (
          <div className={`tab ${activeTab==='register'?'active':''}`} onClick={() => setActiveTab('register')}>
            Register User
          </div>
        )}
      </div>

      {activeTab === 'students' && renderUserTable(students, 'No students registered yet.')}
      {activeTab === 'teachers' && user.role === 'admin' && renderUserTable(teachers, 'No teachers registered yet.')}

      {activeTab === 'enroll' && user.role === 'admin' && (
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
          <div className="card-header"><h2>Register New User</h2></div>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Role</label>
              <select
                value={regForm.role}
                onChange={e => setRegForm({ ...regForm, role: e.target.value })}
                style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #cfd8dc', borderRadius:10, fontSize:14, color:'#263238', background:'#fafafa' }}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Full name" value={regForm.name}
                onChange={e => setRegForm({ ...regForm, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="user@university.edu" value={regForm.email}
                onChange={e => setRegForm({ ...regForm, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min 6 characters" value={regForm.password}
                onChange={e => setRegForm({ ...regForm, password: e.target.value })} required minLength={6} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Registering...' : `Register ${regForm.role === 'teacher' ? 'Teacher' : 'Student'}`}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setActiveTab('students')}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
