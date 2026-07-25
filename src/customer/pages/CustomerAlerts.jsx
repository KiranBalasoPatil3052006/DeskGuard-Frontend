import React, { useState, useEffect } from 'react';
import { getCustomerAlerts } from '../services/customerApi';
import {
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaClock,
  FaDesktop,
  FaCheckCircle
} from 'react-icons/fa';

const CustomerAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, last_page: 1 });

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const res = await getCustomerAlerts({
          search,
          severity: severityFilter !== 'All' ? severityFilter : undefined,
          page: currentPage,
          per_page: 10
        });
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setAlerts(list);
        setMeta(res?.meta || { total: list.length, last_page: 1 });
      } catch (err) {
        console.error('Failed to load customer alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [severityFilter, currentPage]);

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle fw-bold">Critical</span>;
      case 'warning':
        return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-bold">Warning</span>;
      case 'info':
        return <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle fw-bold">Info</span>;
      default:
        return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-bold">Warning</span>;
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Title Header */}
      <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          System Alerts & Issues
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, marginTop: '4px' }}>
          Important system conditions requiring attention across your AMC systems.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          {/* Search Input */}
          <div className="position-relative flex-grow-1" style={{ maxWidth: '400px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search alert description or computer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: '38px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1'
              }}
            />
            <FaSearch
              style={{
                position: 'absolute',
                top: '50%',
                left: '12px',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Severity Filters */}
          <div className="d-flex align-items-center gap-1 flex-wrap">
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginRight: '6px' }}>
              <FaFilter /> Severity:
            </span>
            {['All', 'Critical', 'Warning', 'Info'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSeverityFilter(s);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: severityFilter === s ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: severityFilter === s ? '#2563eb' : '#ffffff',
                  color: severityFilter === s ? '#ffffff' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading Alerts...</span>
          </div>
        </div>
      ) : alerts.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '48px 24px',
            textAlign: 'center'
          }}
        >
          <FaCheckCircle size={42} className="text-success mb-3" />
          <h5 style={{ fontWeight: 700, color: '#0f172a' }}>No Alerts Found</h5>
          <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
            All systems under your AMC account are operating normally without any open alerts.
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '18px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                <div className="d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor:
                        alert.severity?.toLowerCase() === 'critical'
                          ? 'rgba(244, 63, 94, 0.1)'
                          : 'rgba(245, 158, 11, 0.1)',
                      color: alert.severity?.toLowerCase() === 'critical' ? '#f43f5e' : '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem'
                    }}
                  >
                    <FaExclamationTriangle />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {alert.description}
                    </h5>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      <FaDesktop className="me-1 text-secondary" /> Machine: <strong>{alert.machine_name}</strong>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  {getSeverityBadge(alert.severity)}
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }} className="d-flex align-items-center gap-1">
                    <FaClock /> {new Date(alert.detected_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {meta.last_page > 1 && (
        <div className="d-flex justify-content-between align-items-center pt-2">
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Page <strong>{currentPage}</strong> of <strong>{meta.last_page}</strong> ({meta.total} Alerts)
          </span>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={currentPage === meta.last_page}
              onClick={() => setCurrentPage((p) => Math.min(meta.last_page, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAlerts;
