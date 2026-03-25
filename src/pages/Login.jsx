import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, saveAuth } = useAuth();
  const [role, setRole] = useState('STUDENT');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/student', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = role === 'ADMIN' ? '/api/admin/login' : '/api/students/login';
      const response = await api.post(endpoint, {
        email: formData.email,
        password: formData.password
      });
      if (role === 'ADMIN') {
        saveAuth(response.data.token, {
          email: response.data.email,
          role: response.data.role,
          name: 'Admin'
        });
        navigate('/admin', { replace: true });
      } else {
        saveAuth(response.data.token, {
          studentId: response.data.studentId,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        });
        navigate('/student', { replace: true });
      }
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-particles">
        <span className="auth-particle"></span>
        <span className="auth-particle"></span>
        <span className="auth-particle"></span>
        <span className="auth-particle"></span>
        <span className="auth-particle"></span>
      </div>
      <div className="mascot-sticker">
        <span>🧸</span>
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <h2>{role === 'ADMIN' ? 'Hello Admin' : 'Hello Student'}</h2>
        </div>

        <div className="auth-toggle">
          <button
            type="button"
            className={role === 'STUDENT' ? 'active' : ''}
            onClick={() => setRole('STUDENT')}
          >
            Student Login
          </button>
          <button
            type="button"
            className={role === 'ADMIN' ? 'active' : ''}
            onClick={() => setRole('ADMIN')}
          >
            Admin Login
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-input">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-input">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="button button-primary login-glow" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            New here? <Link className="auth-link" to="/signup">Create a student account</Link>
          </p>
          <p>
            Forgot password? <Link className="auth-link" to="/forgot-password">Reset it</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
