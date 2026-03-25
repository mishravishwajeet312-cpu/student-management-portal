import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getApiError } from '../services/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (step === 1) {
        await api.post('/api/auth/forgot-password', { email });
        setMessage('OTP sent to your email.');
        setStep(2);
      } else if (step === 2) {
        await api.post('/api/auth/verify-otp', { email, otp });
        setMessage('OTP verified. Set your new password.');
        setStep(3);
      } else if (step === 3) {
        await api.post('/api/auth/reset-password', { email, otp, newPassword });
        setMessage('Password updated. You can log in now.');
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
      <div className="auth-card">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p>Follow the steps to regain access</p>
        </div>

        <div className="auth-form">
          <div className="form-input">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={step !== 1}
              required
            />
          </div>

          {step >= 2 && (
            <div className="form-input">
              <label htmlFor="otp">OTP</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the OTP"
                required
              />
            </div>
          )}

          {step === 3 && (
            <div className="form-input">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}

          <button className="button button-primary" onClick={handleNext} disabled={loading}>
            {loading ? 'Please wait...' : step === 3 ? 'Reset Password' : 'Continue'}
          </button>
        </div>

        <div className="auth-footer">
          <p>
            Back to <Link className="auth-link" to="/login">login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
