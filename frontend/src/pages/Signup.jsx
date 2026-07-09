import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    institution_name: '',
    institution_domain: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <h1>Get Started</h1>
        <p>Create your institution account and start managing attendance seamlessly.</p>
        <div className="login-features">
          <div className="login-feature"><span>✦</span><span>Register your Institution</span></div>
          <div className="login-feature"><span>✦</span><span>Add Teachers and Students</span></div>
          <div className="login-feature"><span>✦</span><span>Generate QR Attendance</span></div>
          <div className="login-feature"><span>✦</span><span>View Reports and Analytics</span></div>
        </div>
      </div>

      <div className="login-right">
        <h2>Create Account</h2>
        <p>Set up your institution and admin profile</p>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 8, fontSize: '0.75rem', fontWeight: 700, color: '#00796b', textTransform: 'uppercase', letterSpacing: 1 }}>
            Institution Details
          </div>

          <div className="form-group">
            <label>Institution Name</label>
            <input
              type="text"
              name="institution_name"
              placeholder="e.g. University of Technology"
              value={form.institution_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Institution Domain</label>
            <input
              type="text"
              name="institution_domain"
              placeholder="e.g. uot.edu.pk"
              value={form.institution_domain}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: 8, marginTop: 8, fontSize: '0.75rem', fontWeight: 700, color: '#00796b', textTransform: 'uppercase', letterSpacing: 1 }}>
            Admin Account
          </div>

          <div className="form-group">
            <label>Your Full Name</label>
            <input
              type="text"
              name="admin_name"
              placeholder="e.g. John Smith"
              value={form.admin_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="admin_email"
              placeholder="admin@uot.edu.pk"
              value={form.admin_email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="admin_password"
                placeholder="Min 6 characters"
                value={form.admin_password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: '8px', padding: '12px' }}
          >
            {loading ? 'Creating Account...' : 'Create Institution →'}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: '0.875rem', color: '#78909c' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#009688', fontWeight: 700, textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
