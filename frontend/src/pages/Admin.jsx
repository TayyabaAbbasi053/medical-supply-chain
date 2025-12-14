import React, { useState } from 'react';
import axios from 'axios';
import './Admin.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Manufacturer',
    password: ''
  });

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/admin/login`, {
        email: loginForm.email,
        password: loginForm.password
      });

      setAdminEmail(loginForm.email);
      setIsLoggedIn(true);
      setLoginForm({ email: '', password: '' });
      setMessage({ type: 'success', text: '✅ Admin login successful!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Login failed' });
    }
    setLoading(false);
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.role || !formData.password) {
      setMessage({ type: 'error', text: '❌ Please fill all fields' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/register-user`, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password,
        adminEmail: adminEmail
      });

      setMessage({ type: 'success', text: response.data.message });
      setFormData({ name: '', email: '', role: 'Manufacturer', password: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Registration failed' });
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdminEmail('');
    setMessage({ type: 'success', text: 'Logged out successfully' });
  };

  // LOGIN PAGE
  if (!isLoggedIn) {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h1>🛡️ Admin Login</h1>
          <p>Login to register users in the system</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })}>✕</button>
          </div>
        )}

        <div className="admin-section" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <form onSubmit={handleAdminLogin}>
            <h2>Admin Login</h2>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
                placeholder="admin@hospital.com"
              />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? '⏳ Logging in...' : '✓ Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // REGISTRATION PAGE (After login)
  return (
    <div className="admin-container">
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>🛡️ Admin Dashboard</h1>
            <p>Register new users in the system</p>
          </div>
          <button onClick={handleLogout} className="btn-danger">
            🚪 Logout
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })}>✕</button>
        </div>
      )}

      <div className="admin-section">
        <h2>📝 Register New User</h2>
        <form onSubmit={handleRegisterUser}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter full name"
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter email address"
            />
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="Manufacturer">Manufacturer</option>
              <option value="Distributor">Distributor</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Patient">Patient</option>
            </select>
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Enter password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? '⏳ Registering...' : '✓ Register User'}
          </button>
        </form>
      </div>
    </div>
  );
}
