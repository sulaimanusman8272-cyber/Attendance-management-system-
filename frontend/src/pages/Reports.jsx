import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import CustomSelect from '../components/CustomSelect';

export default function Reports() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [report, setReport] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [activeTab, setActiveTab] = useState('attendance');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data.courses)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    Promise.all([
      api.get(`/reports/course/${selectedCourse}/attendance`),
      api.get(`/reports/course/${selectedCourse}/defaulters`)
    ]).then(([att, def]) => {
      setReport(att.data.report);
      setDefaulters(def.data.defaulters);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [selectedCourse]);

  const getPct = pct => {
    const n = parseFloat(pct) || 0;
    if (n >= 75) return { cls: '', badge: 'badge-green' };
    if (n >= 50) return { cls: 'mid', badge: 'badge-orange' };
    return { cls: 'low', badge: 'badge-red' };
  };

  const courseOptions = courses.map(c => ({ value: c.id, label: `${c.name} (${c.code})` }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p>Attendance analytics and defaulter tracking</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2>Select Course</h2></div>
        <div style={{ maxWidth: 400 }}>
          <CustomSelect
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            options={courseOptions}
            placeholder="-- Choose a course --"
          />
        </div>
      </div>

      {selectedCourse && (
        <>
          {report.length > 0 && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{report.length}</div>
                <div className="stat-label">Total Students</div>
              </div>
              <div className="stat-card orange">
                <div className="stat-number">{defaulters.length}</div>
                <div className="stat-label">Defaulters (below 75%)</div>
              </div>
              <div className="stat-card purple">
                <div className="stat-number">{report[0]?.total_sessions || 0}</div>
                <div className="stat-label">Total Sessions</div>
              </div>
            </div>
          )}

          <div className="tabs">
            <div className={`tab ${activeTab==='attendance'?'active':''}`} onClick={()=>setActiveTab('attendance')}>Attendance Report</div>
            <div className={`tab ${activeTab==='defaulters'?'active':''}`} onClick={()=>setActiveTab('defaulters')}>Defaulters ({defaulters.length})</div>
          </div>

          {loading && <div className="empty-state"><p>Loading...</p></div>}

          {!loading && activeTab === 'attendance' && (
            <div className="card">
              <div className="card-header">
                <h2>Student Attendance</h2>
                <span className="badge badge-teal">{report.length} students</span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Student</th><th>Email</th><th>Attended</th><th>Total</th><th>Attendance %</th></tr></thead>
                  <tbody>
                    {report.map(r => {
                      const { cls, badge } = getPct(r.attendance_percentage);
                      return (
                        <tr key={r.student_id}>
                          <td style={{ fontWeight:600 }}>{r.name}</td>
                          <td style={{ color:'#78909c' }}>{r.email}</td>
                          <td>{r.attended_sessions}</td>
                          <td>{r.total_sessions}</td>
                          <td>
                            <div style={{ display:'flex', alignItems:'center' }}>
                              <div className="progress-bg">
                                <div className={`progress-fill ${cls}`} style={{ width:`${r.attendance_percentage}%` }} />
                              </div>
                              <span className={`badge ${badge}`}>{r.attendance_percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {report.length === 0 && (
                      <tr><td colSpan="5"><div className="empty-state"><div className="empty-icon">📊</div><p>No data available.</p></div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && activeTab === 'defaulters' && (
            <div className="card">
              <div className="card-header">
                <h2>Defaulter List</h2>
                <span className="badge badge-red">{defaulters.length} students below 75%</span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Student</th><th>Email</th><th>Attended</th><th>Total</th><th>Attendance %</th></tr></thead>
                  <tbody>
                    {defaulters.map(r => (
                      <tr key={r.student_id}>
                        <td style={{ fontWeight:600 }}>{r.name}</td>
                        <td style={{ color:'#78909c' }}>{r.email}</td>
                        <td>{r.attended_sessions}</td>
                        <td>{r.total_sessions}</td>
                        <td><span className="badge badge-red">{r.attendance_percentage}%</span></td>
                      </tr>
                    ))}
                    {defaulters.length === 0 && (
                      <tr><td colSpan="5"><div className="empty-state"><div className="empty-icon">🎉</div><p>No defaulters found.</p></div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
