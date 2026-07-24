import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaDesktop,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileAlt,
  FaHeartbeat,
  FaSync,
  FaDownload,
  FaShieldAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaLaptop,
  FaWindows,
  FaLinux,
  FaApple
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getCustomerDashboard } from '../services/customerApi';
import { downloadReport } from '../../services/reports';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await getCustomerDashboard();
      const payload = res?.data?.data || res?.data || res;
      setData(payload);
    } catch (err) {
      console.error('Failed to load customer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboard();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleDownload = async (report) => {
    const id = typeof report === 'object' ? report.id : report;
    const fmt = typeof report === 'object' ? (report.format || 'pdf') : 'pdf';
    setDownloadingId(id);
    try {
      const res = await downloadReport(id);
      const blobData = res?.data ?? res;
      const blob = blobData instanceof Blob ? blobData : new Blob([blobData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.${fmt}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download report:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Customer Dashboard...</span>
        </div>
      </div>
    );
  }

  const totals = data?.totals || { registeredSystems: 0, healthySystems: 0, warningSystems: 0, criticalSystems: 0, offlineSystems: 0 };
  const recentAlerts = data?.recentAlerts || [];
  const recentChanges = data?.recentChanges || [];

  return (
    <div className="container-fluid p-0">
      {/* Customer Header Banner */}
      <div
        className="card mb-4 border-0 text-white p-4"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)'
        }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-white text-primary fw-bold px-3 py-1 rounded-pill small">
                READ-ONLY CUSTOMER PORTAL
              </span>
              <span className="badge bg-success bg-opacity-25 text-white border border-white border-opacity-25 px-3 py-1 rounded-pill small">
                AMC Active
              </span>
            </div>
            <h3 className="fw-bold mb-1" style={{ fontSize: '1.6rem' }}>
              Welcome, {data?.customerName || user?.name || 'Valued Customer'}!
            </h3>
            <p className="mb-0 opacity-90 small">
              Company: <strong>{data?.companyName}</strong> &bull; Mobile: <strong>{data?.mobileNumber}</strong> &bull; Monitor your operational systems &amp; download reports.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-light btn-sm fw-semibold d-flex align-items-center gap-2 px-3 py-2"
              onClick={handleRefresh}
              style={{ borderRadius: '8px' }}
            >
              <FaSync className={isRefreshing ? 'spin-icon' : ''} size={12} />
              <span>Refresh Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Summary Cards Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="card border-0 p-3 h-100 shadow-sm" style={{ borderRadius: '12px', borderLeft: '4px solid #2563eb' }}>
            <span className="small text-muted fw-bold text-uppercase">Healthy</span>
            <div className="h3 fw-bold mb-1 text-success">{totals.healthySystems}</div>
            <span className="small text-muted">Optimal Status</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-2">
          <div className="card border-0 p-3 h-100 shadow-sm" style={{ borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
            <span className="small text-muted fw-bold text-uppercase">Warning</span>
            <div className="h3 fw-bold mb-1 text-warning">{totals.warningSystems}</div>
            <span className="small text-muted">Minor Issues</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-2">
          <div className="card border-0 p-3 h-100 shadow-sm" style={{ borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
            <span className="small text-muted fw-bold text-uppercase">Critical</span>
            <div className="h3 fw-bold mb-1 text-danger">{totals.criticalSystems}</div>
            <span className="small text-muted">Action Needed</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-2">
          <div className="card border-0 p-3 h-100 shadow-sm" style={{ borderRadius: '12px', borderLeft: '4px solid #64748b' }}>
            <span className="small text-muted fw-bold text-uppercase">Offline</span>
            <div className="h3 fw-bold mb-1 text-secondary">{totals.offlineSystems}</div>
            <span className="small text-muted">Disconnected</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <div className="card border-0 p-3 h-100 shadow-sm bg-primary text-white" style={{ borderRadius: '12px' }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="small opacity-75 fw-bold text-uppercase">Average Health Score</span>
                <div className="h2 fw-bold mb-0">{data?.averageHealthScore || 94}%</div>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-circle">
                <FaHeartbeat className="fs-3 text-white" />
              </div>
            </div>
            <div className="small opacity-75 mt-1">Calculated in backend</div>
          </div>
        </div>
      </div>

      {/* Recent Alerts & Recent Changes Grid */}
      <div className="row g-4">
        {/* Recent Alerts */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaExclamationTriangle className="text-warning" /> Recent Alerts
              </h6>
              <button className="btn btn-link btn-sm text-decoration-none p-0" onClick={() => navigate('/customer/alerts')}>
                View All
              </button>
            </div>

            {recentAlerts.length > 0 ? (
              <div className="d-flex flex-column gap-2">
                {recentAlerts.map((a) => (
                  <div key={a.id} className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold text-dark small">{a.machine} &bull; {a.alert}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>{new Date(a.time).toLocaleString()}</div>
                    </div>
                    <span className={`badge ${a.severity === 'Critical' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                      {a.severity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted small">No active system alerts.</div>
            )}
          </div>
        </div>

        {/* Recent Changes */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaFileAlt className="text-info" /> Recent System Changes
              </h6>
            </div>

            {recentChanges.length > 0 ? (
              <div className="d-flex flex-column gap-2">
                {recentChanges.map((c) => (
                  <div key={c.id} className="p-3 bg-light rounded-3 border">
                    <div className="fw-semibold text-dark small">{c.machine}: {c.change}</div>
                    <div className="text-muted d-flex justify-content-between" style={{ fontSize: '0.72rem' }}>
                      <span>Category: {c.category}</span>
                      <span>{new Date(c.time).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted small">No recent hardware or software changes.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
