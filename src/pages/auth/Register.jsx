import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa';
import api from '../../services/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/auth/register', { name, email, password, role });
      navigate('/login');
    } catch (err) {
      setError(err?.detail || err?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card shadow-sm border border-light">
        <div className="text-center mb-3 fs-5 fw-bold d-flex align-items-center justify-content-center text-primary">
          <FaUserPlus className="me-2" />
          DeskGuard
        </div>
        
        <h5 className="fw-bold text-center mb-1 text-dark">Sign Up</h5>
        <p className="text-center text-muted mb-3" style={{ fontSize: '0.82rem' }}>Create a new account.</p>

        <form onSubmit={handleRegister} className="d-flex flex-column gap-3">
          {error && <div className="alert alert-danger py-2 small mb-1">{error}</div>}
          <div>
            <label className="form-label mb-1">Name</label>
            <input 
              type="text" 
              className="form-control form-control-sm" 
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label mb-1">Email</label>
            <input 
              type="email" 
              className="form-control form-control-sm" 
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label mb-1">Password</label>
            <input 
              type="password" 
              className="form-control form-control-sm" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="d-flex gap-3 justify-content-center my-1">
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="radio" 
                name="roleOption" 
                id="roleUser" 
                checked={role === 'user'} 
                onChange={() => setRole('user')} 
              />
              <label className="form-check-label small" htmlFor="roleUser">User</label>
            </div>
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="radio" 
                name="roleOption" 
                id="roleAdmin" 
                checked={role === 'admin'} 
                onChange={() => setRole('admin')} 
              />
              <label className="form-check-label small" htmlFor="roleAdmin">Admin</label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 mt-1 fw-semibold" disabled={submitting}>
            {submitting ? 'Creating Account...' : 'Sign Up'}
          </button>

          <div className="text-center small text-muted">
            Already have an account? <Link to="/login" className="text-primary text-decoration-none fw-semibold">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
