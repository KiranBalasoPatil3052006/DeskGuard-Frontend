import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerDashboard } from '../services/customerApi';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaDesktop,
  FaArrowRight,
  FaSync,
  FaBuilding,
  FaPhoneAlt,
  FaEnvelope
} from 'react-icons/fa';

const CustomerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      setError(null);
      const res = await getCustomerDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load customer dashboard:', err);
      setError('Unable to load your company dashboard. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  const customer = data?.customer_info || {};
  const summary = data?.summary_cards || { total_systems: 0, healthy: 0, warning: 0, critical: 0, offline: 0, average_health_score: 100 };
  const recentAlerts = data?.recent_alerts || [];

  return (
    <div className="d-flex flex-column gap-4">
      {/* Company Header Banner */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px 28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-primary-subtle text-primary fw-bold" style={{ fontSize: '0.75rem' }}>
                AMC CUSTOMER ACCOUNT
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              {customer.company_name || 'ABC Technologies'}
            </h2>
            <div className="d-flex flex-wrap align-items-center gap-3 mt-2" style={{ fontSize: '0.88rem', color: '#64748b' }}>
              <span className="d-flex align-items-center gap-1">
                <FaBuilding style={{ color: '#94a3b8' }} /> {customer.customer_name || 'Customer Account'}
              </span>
              <span>•</span>
              <span className="d-flex align-items-center gap-1">
                <FaPhoneAlt style={{ color: '#94a3b8' }} /> {customer.mobile_number || '9876543210'}
              </span>
              <span>•</span>
              <span className="d-flex align-items-center gap-1">
                <FaEnvelope style={{ color: '#94a3b8' }} /> {customer.email || 'customer@company.com'}
              </span>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 align-self-start align-self-md-center"
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <FaSync className={refreshing ? 'spin-icon' : ''} />
            <span>Refresh Health Status</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* 4 Summary Cards Row */}
      <div className="row g-3">
        {/* Healthy Card */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '120px'
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Healthy
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FaCheckCircle />
              </div>
            </div>
            <div className="d-flex align-items-baseline justify-content-between">
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {summary.healthy}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                Systems Normal
              </span>
            </div>
          </div>
        </div>

        {/* Warning Card */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '120px'
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Warning
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FaExclamationTriangle />
              </div>
            </div>
            <div className="d-flex align-items-baseline justify-content-between">
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {summary.warning}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>
                Minor Attention Needed
              </span>
            </div>
          </div>
        </div>

        {/* Critical Card */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '120px'
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Critical
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(244, 63, 94, 0.1)',
                  color: '#f43f5e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FaTimesCircle />
              </div>
            </div>
            <div className="d-flex align-items-baseline justify-content-between">
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {summary.critical}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#f43f5e', fontWeight: 600 }}>
                Immediate Attention
              </span>
            </div>
          </div>
        </div>

        {/* Offline Card */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '120px'
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Offline
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(100, 116, 139, 0.1)',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FaDesktop />
              </div>
            </div>
            <div className="d-flex align-items-baseline justify-content-between">
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {summary.offline}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                Unreachable
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Overall Health Score & Recent Alerts */}
      <div className="row g-4">
        {/* Overall Health Score Widget */}
        <div className="col-12 col-lg-5">
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '28px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="mb-3">
              Overall Company System Health
            </span>
            <div className="position-relative d-inline-flex align-items-center justify-content-center mb-3">
              <svg width="150" height="150" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={summary.average_health_score >= 85 ? '#10b981' : summary.average_health_score >= 60 ? '#f59e0b' : '#f43f5e'}
                  strokeWidth="3.2"
                  strokeDasharray={`${summary.average_health_score}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                  {summary.average_health_score}%
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Health Score</span>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', maxWidth: '280px', margin: 0 }}>
              {summary.average_health_score >= 85
                ? 'Your systems are operating smoothly with high operational stability.'
                : summary.average_health_score >= 60
                ? 'Some computers require routine updates or maintenance.'
                : 'Attention required! Multiple systems have unresolved critical alerts.'}
            </p>
            <button
              className="btn btn-primary btn-sm mt-3 d-flex align-items-center gap-2"
              onClick={() => navigate('/customer/systems')}
              style={{ padding: '8px 20px', borderRadius: '8px', fontWeight: 600 }}
            >
              <span>View All Systems ({summary.total_systems})</span>
              <FaArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Recent 5 Alerts Widget */}
        <div className="col-12 col-lg-7">
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Recent System Alerts
                </h5>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Showing 5 most recent alerts requiring attention
                </span>
              </div>
              <button
                className="btn btn-link btn-sm text-decoration-none fw-bold"
                onClick={() => navigate('/customer/alerts')}
                style={{ fontSize: '0.82rem', color: '#2563eb' }}
              >
                View All Alerts →
              </button>
            </div>

            {recentAlerts.length === 0 ? (
              <div className="text-center py-5 text-muted flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                <FaCheckCircle size={36} className="text-success mb-2" />
                <span style={{ fontWeight: 600 }}>No Recent Alerts</span>
                <span style={{ fontSize: '0.82rem' }}>All systems under your AMC account are operating normally.</span>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2 flex-grow-1">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor:
                            alert.severity?.toLowerCase() === 'critical' ? '#f43f5e' : alert.severity?.toLowerCase() === 'warning' ? '#f59e0b' : '#3b82f6'
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                          {alert.alert_name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Target: <strong>{alert.machine_name}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="text-end" style={{ whiteSpace: 'nowrap' }}>
                      <span
                        className={`badge ${
                          alert.severity?.toLowerCase() === 'critical' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning-emphasis'
                        } fw-bold mb-1`}
                        style={{ fontSize: '0.72rem' }}
                      >
                        {alert.severity}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {new Date(alert.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
