import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import CustomSelect from '../components/CustomSelect';

export default function Enrollments() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollForm, setEnrollForm] = useState({ student_id: '', course_id: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const notify = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setError(''); setMessage(''); }, 4000);
  };

  useEffect(() => {
    api.get('/users/students').then(r => setStudents(r.data.students)).catch(() => {});
    api.get('/courses').then(r => setCourses(r.data.courses)).catch(() => {});
  }, []);

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
          <h1>Enrollments</h1>
          <p>Enroll students into courses</p>
        </div>
      </div>

      {message && <div className="alert alert-success">✓ {message}</div>}
      {error   && <div className="alert alert-error">⚠ {error}</div>}

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
    </div>
  );
}
