import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CustomSelect from '../components/CustomSelect';

export default function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [activeTab, setActiveTab] = useState('students');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showModal, setShowModal] = useState(false);

  const notify = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setError(''); setMessage(''); }, 4000);
  };

  const fetchAll = () => {
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
      setActiveTab(regForm.role === 'teacher' ? 'teachers' : 'students');
      setRegForm({ name: '', email: '', password: '', role: 'student' });
      setShowModal(false);
      fetchAll();
    } catch (err) {
      notify(err.response?.data?.message || 'Registration failed.', true);
    } finally { setLoading(false); }
  };

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
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Register User</button>
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
      </div>

      {activeTab === 'students' && renderUserTable(students, 'No students registered yet.')}
      {activeTab === 'teachers' && user.role === 'admin' && renderUserTable(teachers, 'No teachers registered yet.')}

      {/* Register User Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 460,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)', position: 'relative'
          }} onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#263238' }}>Register New User</h2>
              <button onClick={() => setShowModal(false)} style={{
                background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#90a4ae', lineHeight: 1
              }}>×</button>
            </div>

            {error && <div className="alert alert-error">⚠ {error}</div>}

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Role</label>
                <CustomSelect
                  value={regForm.role}
                  onChange={e => setRegForm({ ...regForm, role: e.target.value })}
                  options={[
                    { value: 'student', label: 'Student' },
                    { value: 'teacher', label: 'Teacher' },
                  ]}
                  placeholder="-- Select Role --"
                />
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
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Registering...' : `Register ${regForm.role === 'teacher' ? 'Teacher' : 'Student'}`}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
