import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaLock, FaMobileAlt, FaUserShield, FaKey, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { requestCustomerOtp, verifyCustomerOtp } from '../../services/auth';
import './Register.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithToken, loading: authLoading } = useAuth();

  // Tab State: 'admin' | 'customer'
  const [loginType, setLoginType] = useState('admin');

  // Admin Login State
  const [email, setEmail] = useState('kiranbalasopatil33@gmail.com');
  const [password, setPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // Customer OTP Login State
  // Step: 1 = Enter Mobile Number, 2 = Enter OTP
  const [otpStep, setOtpStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileTouched, setMobileTouched] = useState(false);
  const [otp, setOtp] = useState('');
  const [customerError, setCustomerError] = useState('');
  const [customerLoading, setCustomerLoading] = useState(false);

  // Admin Login Handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminError('');
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setAdminError(err?.message || err?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  // Mobile input handler (strict numeric filter, max 10 digits)
  const handleMobileChange = (e) => {
    const raw = e.target.value;
    const numeric = raw.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(numeric);
    setMobileTouched(true);
    setCustomerError('');
  };

  // OTP input handler (strict numeric filter, max 6 digits)
  const handleOtpChange = (e) => {
    const raw = e.target.value;
    const numeric = raw.replace(/\D/g, '').slice(0, 6);
    setOtp(numeric);
    setCustomerError('');
  };

  // Customer Request OTP Handler
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setCustomerError('');

    if (mobileNumber.length !== 10) {
      setCustomerError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setCustomerLoading(true);
    try {
      await requestCustomerOtp(mobileNumber);
    } catch (err) {
      console.warn('Backend OTP notice:', err);
    } finally {
      setCustomerLoading(false);
      setOtpStep(2);
      setOtp('111111');
    }
  };

  // Customer Verify OTP Handler
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setCustomerError('');

    if (otp.length !== 6) {
      setCustomerError('Please enter the 6-digit OTP.');
      return;
    }

    setCustomerLoading(true);
    try {
      const res = await verifyCustomerOtp(mobileNumber, otp);
      const data = res.data?.data || res.data || res;
      if (data?.token && data?.user) {
        loginWithToken(data.user, data.token);
        navigate('/dashboard', { replace: true });
      } else {
        setCustomerError('OTP verification succeeded but no session token was received.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid OTP. Development Mode: Use OTP 111111.';
      setCustomerError(msg);
    } finally {
      setCustomerLoading(false);
    }
  };

  const isMobileValid = mobileNumber.length === 10;

  return (
    <div className="auth-container">
      <div className="auth-card shadow-sm border border-light">
        {/* Header */}
        <div className="text-center mb-3 fs-4 fw-bold d-flex align-items-center justify-content-center text-primary">
          <FaLock className="me-2" />
          DeskGuard
        </div>

        <h4 className="fw-bold text-center text-dark">
          {loginType === 'admin' ? 'Welcome Back' : 'Customer Portal'}
        </h4>
        <p className="text-center text-muted mb-3 small">
          {loginType === 'admin' ? 'Sign in with your email & password.' : 'Sign in securely using your registered mobile number.'}
        </p>

        {/* Tab Switcher */}
        <div className="d-flex rounded p-1 mb-4" style={{ backgroundColor: 'var(--bg-input, #f0f4f8)', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <button
            type="button"
            className={`btn btn-sm flex-fill fw-semibold d-flex align-items-center justify-content-center gap-2 py-2 border-0 ${loginType === 'admin' ? 'btn-primary shadow-sm text-white' : 'text-muted'}`}
            style={{ borderRadius: '6px' }}
            onClick={() => { setLoginType('admin'); setAdminError(''); setCustomerError(''); }}
          >
            <FaUserShield /> Staff / Admin
          </button>
          <button
            type="button"
            className={`btn btn-sm flex-fill fw-semibold d-flex align-items-center justify-content-center gap-2 py-2 border-0 ${loginType === 'customer' ? 'btn-primary shadow-sm text-white' : 'text-muted'}`}
            style={{ borderRadius: '6px' }}
            onClick={() => { setLoginType('customer'); setAdminError(''); setCustomerError(''); }}
          >
            <FaMobileAlt /> Customer Login
          </button>
        </div>

        {/* Staff / Admin Login Form */}
        {loginType === 'admin' && (
          <form onSubmit={handleAdminLogin} className="d-flex flex-column gap-3">
            {adminError && (
              <div className="alert alert-danger py-2 small mb-0" role="alert">
                {adminError}
              </div>
            )}

            <div>
              <label className="form-label mb-1">Email Address</label>
              <input
                type="email"
                className="form-control form-control-sm"
                placeholder="e.g. admin@deskguard.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="d-flex justify-content-between mb-1">
                <label className="form-label mb-0">Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.78rem' }} className="text-primary text-decoration-none">Forgot password?</Link>
              </div>
              <input
                type="password"
                className="form-control form-control-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-check text-start">
              <input type="checkbox" className="form-check-input" id="rememberMe" />
              <label className="form-check-label small text-muted" htmlFor="rememberMe">Remember me</label>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 mt-2 fw-semibold" disabled={authLoading}>
              {authLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="text-center small text-muted mt-2">
              Don't have an account? <Link to="/register" className="text-primary text-decoration-none fw-semibold">Sign up</Link>
            </div>
          </form>
        )}

        {/* Customer OTP Login Form */}
        {loginType === 'customer' && (
          <div>
            {customerError && (
              <div className="alert alert-danger py-2 small mb-3" role="alert">
                {customerError}
              </div>
            )}

            {/* STEP 1: Enter Mobile Number */}
            {otpStep === 1 && (
              <form onSubmit={handleRequestOtp} className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label mb-1 fw-semibold">
                    Mobile Number
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light text-muted fw-semibold border-end-0">
                      +91
                    </span>
                    <input
                      type="tel"
                      className={`form-control ${mobileTouched && !isMobileValid ? 'is-invalid' : ''}`}
                      placeholder="10-digit mobile number"
                      value={mobileNumber}
                      onChange={handleMobileChange}
                      maxLength={10}
                      required
                    />
                  </div>
                  {mobileTouched && !isMobileValid && (
                    <div className="text-danger small mt-1">
                      Please enter a valid 10-digit mobile number.
                    </div>
                  )}
                  <div className="form-text small text-muted">
                    Must contain exactly 10 digits (numeric only).
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 mt-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  disabled={!isMobileValid || customerLoading}
                >
                  {customerLoading ? (
                    <><span className="spinner-border spinner-border-sm" /> Sending OTP...</>
                  ) : (
                    <><FaMobileAlt /> Get OTP</>
                  )}
                </button>

                <div className="text-center small text-muted mt-1">
                  Not a registered customer? Contact your AMC administrator to register your account.
                </div>
              </form>
            )}

            {/* STEP 2: Enter OTP */}
            {otpStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-muted">
                    OTP sent to <strong>+91 {mobileNumber}</strong>
                  </span>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none d-flex align-items-center gap-1"
                    onClick={() => { setOtpStep(1); setOtp(''); setCustomerError(''); }}
                  >
                    <FaArrowLeft style={{ fontSize: '0.75rem' }} /> Change
                  </button>
                </div>

                {/* Development Mode Notice */}
                <div
                  className="alert alert-info py-2 px-3 small border-0 mb-2"
                  style={{ backgroundColor: 'rgba(13, 202, 240, 0.12)', color: '#055160', borderRadius: '8px' }}
                >
                  <div className="fw-bold d-flex align-items-center gap-1 mb-1">
                    ⚡ Development Mode
                  </div>
                  <div>Use OTP: <strong>111111</strong></div>
                </div>

                <div>
                  <label className="form-label mb-1 fw-semibold">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    className="form-control text-center fs-4 fw-bold"
                    placeholder="1 1 1 1 1 1"
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength={6}
                    required
                    style={{ letterSpacing: '0.5rem' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 mt-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  disabled={otp.length !== 6 || customerLoading}
                >
                  {customerLoading ? (
                    <><span className="spinner-border spinner-border-sm" /> Verifying...</>
                  ) : (
                    <><FaKey /> Verify &amp; Sign In</>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
