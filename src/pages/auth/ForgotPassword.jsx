import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaKey } from 'react-icons/fa';
import api from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err?.detail || err?.message || 'Failed to send reset link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card shadow-sm border border-light">
        <div className="text-center mb-4 fs-4 fw-bold d-flex align-items-center justify-content-center text-primary">
          <FaKey className="me-2" />
          DeskGuard
        </div>

        <h4 className="fw-bold text-center text-dark">Reset Password</h4>
        <p className="text-center text-muted mb-4 small">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {!submitted ? (
          <form onSubmit={handleReset} className="d-flex flex-column gap-3">
            {error && <div className="alert alert-danger py-2 small mb-1">{error}</div>}
            <div>
              <label className="form-label mb-1">Email Address</label>
              <input 
                type="email" 
                className="form-control form-control-sm" 
                placeholder="e.g. user@deskguard.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 mt-2 fw-semibold" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="alert bg-success bg-opacity-10 text-success border border-success border-opacity-10 text-center mb-4 p-3 rounded" role="alert" style={{ fontSize: '0.82rem' }}>
            Password reset link sent to <strong>{email}</strong>.<br/>Please check your inbox.
          </div>
        )}

        <div className="text-center small text-muted mt-3">
          Remember your password? <Link to="/login" className="text-primary text-decoration-none fw-semibold">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
