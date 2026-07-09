import React, { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api/axios';
import CustomSelect from '../components/CustomSelect';
import { useAuth } from '../context/AuthContext';

export default function Sessions() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState(user?.role === 'admin' ? 'history' : 'generate');
  const timerRef = useRef(null);

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data.courses)).catch(() => {});
    if (user.role === 'admin') {
      api.get('/sessions/all').then(r => setSessions(r.data.sessions)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (selectedCourse && user.role !== 'admin') {
      api.get(`/sessions/course/${selectedCourse}`)
        .then(r => setSessions(r.data.sessions)).catch(() => {});
    } else if (selectedCourse && user.role === 'admin') {
      api.get('/sessions/all').then(r => {
        setSessions(r.data.sessions.filter(s => s.course_id === parseInt(selectedCourse)));
      }).catch(() => {});
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (activeSession) {
      const expiresAt = new Date(activeSession.expires_at).getTime();
      timerRef.current = setInterval(() => {
        const rem = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
        setTimeLeft(rem);
        if (rem === 0) clearInterval(timerRef.current);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [activeSession]);

  const notify = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setError(''); setMessage(''); }, 4000);
  };

  const handleGenerate = async () => {
    if (!selectedCourse) return notify('Please select a course first.', true);
    try {
      const res = await api.post('/sessions', { course_id: selectedCourse, duration_minutes: 2 });
      setActiveSession(res.data.session);
      notify('QR session started! Active for 2 minutes.');
      const upd = await api.get(`/sessions/course/${selectedCourse}`);
      setSessions(upd.data.sessions);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to create session.', true);
    }
  };

  const handleViewAttendance = async (session) => {
    setSelectedSession(session);
    try {
      const res = await api.get(`/attendance/session/${session.id}`);
      setAttendance(res.data.attendance);
      setActiveTab('attendance');
    } catch { setAttendance([]); }
  };

  const fmt = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const courseOptions = courses.map(c => ({ value: c.id, label: `${c.name} (${c.code})` }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Attendance Sessions</h1>
          <p>Generate QR codes and track attendance</p>
        </div>
      </div>

      {message && <div className="alert alert-success">✓ {message}</div>}
      {error   && <div className="alert alert-error">⚠ {error}</div>}

      <div className="tabs">
        {user.role === 'teacher' && (
          <div className={`tab ${activeTab==='generate'?'active':''}`} onClick={()=>setActiveTab('generate')}>Generate QR</div>
        )}
        <div className={`tab ${activeTab==='history'?'active':''}`} onClick={()=>setActiveTab('history')}>Session History</div>
        {selectedSession && (
          <div className={`tab ${activeTab==='attendance'?'active':''}`} onClick={()=>setActiveTab('attendance')}>
            Attendance — Session #{selectedSession.id}
          </div>
        )}
      </div>

      {activeTab === 'generate' && user.role === 'teacher' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-header"><h2>Start New Session</h2></div>
            <div className="form-group">
              <label>Select Course</label>
              <CustomSelect
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                options={courseOptions}
                placeholder="-- Choose a course --"
              />
            </div>
            <button className="btn btn-primary" onClick={handleGenerate}>Generate QR Code</button>
          </div>

          <div className="card">
            {activeSession ? (
              <div className="qr-box">
                <QRCodeSVG value={activeSession.qr_token} size={180} fgColor="#004d40" />
                {timeLeft > 0 ? (
                  <>
                    <div className="qr-timer">{fmt(timeLeft)}</div>
                    <p style={{ color:'#78909c', fontSize:'0.85rem', textAlign:'center' }}>
                      QR expires in {fmt(timeLeft)} — Students scan to mark attendance
                    </p>
                  </>
                ) : (
                  <p style={{ color:'#ef5350', fontWeight:700 }}>Session expired</p>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📷</div>
                <p>Generate a QR code to start an attendance session</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <div className="card-header">
            <h2>Session History</h2>
            <div style={{ minWidth: 240 }}>
              <CustomSelect
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                options={courseOptions}
                placeholder="-- Filter by course --"
              />
            </div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Session ID</th>
                  {user.role === 'admin' && <th>Course</th>}
                  {user.role === 'admin' && <th>Teacher</th>}
                  <th>Created At</th>
                  <th>Expires At</th>
                  <th>Status</th>
                  <th>Present</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => {
                  const expired = new Date() > new Date(s.expires_at);
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight:600 }}>#{s.id}</td>
                      {user.role === 'admin' && <td><span className="badge badge-teal">{s.course_name} {s.course_code && `(${s.course_code})`}</span></td>}
                      {user.role === 'admin' && <td>{s.teacher_name || '-'}</td>}
                      <td>{new Date(s.created_at).toLocaleString()}</td>
                      <td>{new Date(s.expires_at).toLocaleString()}</td>
                      <td><span className={`badge ${expired?'badge-red':'badge-green'}`}>{expired?'Expired':'Active'}</span></td>
                      <td><span className="badge badge-teal">{s.present_count || 0}</span></td>
                      <td><button className="btn btn-outline btn-sm" onClick={() => handleViewAttendance(s)}>View Attendance</button></td>
                    </tr>
                  );
                })}
                {sessions.length === 0 && (
                  <tr><td colSpan="5"><div className="empty-state"><div className="empty-icon">📋</div><p>No sessions found.</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && selectedSession && (
        <div className="card">
          <div className="card-header">
            <h2>Attendance — Session #{selectedSession.id}</h2>
            <span className="badge badge-teal">{attendance.length} present</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Student Name</th><th>Email</th><th>Marked At</th></tr></thead>
              <tbody>
                {attendance.map((a, i) => (
                  <tr key={a.id}>
                    <td style={{ color:'#90a4ae' }}>{i+1}</td>
                    <td style={{ fontWeight:600 }}>{a.name}</td>
                    <td style={{ color:'#78909c' }}>{a.email}</td>
                    <td>{new Date(a.marked_at).toLocaleString()}</td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                  <tr><td colSpan="4"><div className="empty-state"><div className="empty-icon">📋</div><p>No attendance marked yet.</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
