import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaDesktop,
  FaHeartbeat,
  FaClock,
  FaShieldAlt,
  FaHdd,
  FaExclamationTriangle,
  FaHistory,
  FaCheckCircle,
  FaTimesCircle,
  FaSync
} from 'react-icons/fa';
import { getCustomerSystemOverview } from '../services/customerApi';

const CustomerSystemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getCustomerSystemOverview(id);
      const payload = res?.data?.data || res?.data || res;
      setData(payload);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load system details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOverview();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading system details...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container-fluid p-0">
        <button className="btn btn-link text-decoration-none p-0 mb-3" onClick={() => navigate('/customer/systems')}>
          <FaArrowLeft /> Back to My Systems
        </button>
        <div className="alert alert-danger py-3" role="alert">
          {error || 'System overview is unavailable or access is restricted.'}
        </div>
      </div>
    );
  }

  const { performance, storage, security, alerts, changes } = data;

  return (
    <div className="container-fluid p-0">
      {/* Back button & Title */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <button className="btn btn-link text-decoration-none p-0 text-muted d-flex align-items-center gap-2" onClick={() => navigate('/customer/systems')}>
          <FaArrowLeft /> <span>Back to My Systems</span>
        </button>
        <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2" onClick={fetchOverview}>
          <FaSync /> Refresh
        </button>
      </div>

      {/* Header Banner */}
      <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: '#fff' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-3 bg-white bg-opacity-10 rounded-3">
              <FaDesktop className="fs-1 text-info" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h4 className="fw-bold mb-0">{data.computerName}</h4>
                <span className={`badge ${data.status === 'Online' ? 'bg-success' : 'bg-secondary'} rounded-pill`}>
                  {data.status}
                </span>
              </div>
              <p className="mb-0 opacity-75 small">
                {data.operatingSystem} ({data.osVersion || 'x64'}) &bull; IP: {data.ipAddress} &bull; Serial: {data.serialNumber || 'SN-100482'}
              </p>
            </div>
          </div>

          <div className="text-md-end">
            <div className="small opacity-75">Health Score</div>
            <div className="h2 fw-bold text-success mb-0">{data.healthScore}%</div>
            <div className="small text-muted" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
              Last Seen: {data.lastSeen ? new Date(data.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
            </div>
          </div>
        </div>
      </div>

      {/* System Overview Details Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '12px' }}>
            <span className="small text-muted fw-bold text-uppercase mb-2 d-block"><FaClock className="me-1 text-primary" /> System Uptime</span>
            <div className="h5 fw-bold text-dark mb-1">{data.uptime}</div>
            <span className="small text-muted" style={{ fontSize: '0.75rem' }}>Booted: {data.lastBoot ? new Date(data.lastBoot).toLocaleDateString() : 'Today'}</span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '12px' }}>
            <span className="small text-muted fw-bold text-uppercase mb-2 d-block"><FaHeartbeat className="me-1 text-danger" /> Battery & Power</span>
            <div className="h5 fw-bold text-dark mb-1">{data.batteryStatus}</div>
            <span className="small text-muted" style={{ fontSize: '0.75rem' }}>Power Source: Standard AC Charger</span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '12px' }}>
            <span className="small text-muted fw-bold text-uppercase mb-2 d-block"><FaShieldAlt className="me-1 text-success" /> Security Health</span>
            <div className="h5 fw-bold text-success mb-1">Protected</div>
            <span className="small text-muted" style={{ fontSize: '0.75rem' }}>All critical security services active</span>
          </div>
        </div>
      </div>

      {/* Performance & Storage Section */}
      <div className="row g-4 mb-4">
        {/* Real-time Performance Metrics */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
            <h6 className="fw-bold text-dark mb-3">Resource Performance</h6>

            <div className="mb-3">
              <div className="d-flex justify-content-between small mb-1">
                <span className="fw-semibold text-muted">CPU Usage</span>
                <span className="fw-bold text-dark">{performance?.cpuPercentage}%</span>
              </div>
              <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${performance?.cpuPercentage}%` }} />
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between small mb-1">
                <span className="fw-semibold text-muted">RAM Memory</span>
                <span className="fw-bold text-dark">{performance?.ramPercentage}%</span>
              </div>
              <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                <div className="progress-bar bg-info" role="progressbar" style={{ width: `${performance?.ramPercentage}%` }} />
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between small mb-1">
                <span className="fw-semibold text-muted">Disk Storage</span>
                <span className="fw-bold text-dark">{performance?.diskPercentage}%</span>
              </div>
              <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${performance?.diskPercentage}%` }} />
              </div>
            </div>

            <div className="small text-muted pt-2 border-top">
              Network Adapter: <strong>{performance?.networkStatus}</strong>
            </div>
          </div>
        </div>

        {/* Storage Drives Section */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaHdd className="text-primary" /> Storage Drives
            </h6>

            {storage && storage.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {storage.map((d) => (
                  <div key={d.drive} className="p-3 bg-light rounded-3 border">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold text-dark">{d.drive} Drive</span>
                      <span className="badge bg-success-subtle text-success border px-2 py-1">{d.status}</span>
                    </div>
                    <div className="small text-muted mb-2" style={{ fontSize: '0.78rem' }}>
                      Used: {d.usedGb} GB / Free: {d.freeGb} GB (Total: {d.totalGb} GB)
                    </div>
                    <div className="progress" style={{ height: '6px', borderRadius: '3px' }}>
                      <div className="progress-bar bg-success" role="progressbar" style={{ width: `${d.usedPercentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted">No drive data available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Security Checklist & System Events Grid */}
      <div className="row g-4">
        {/* Security Status */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaShieldAlt className="text-success" /> System Security
            </h6>

            <div className="d-flex flex-column gap-2">
              <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
                <span className="small text-muted">Firewall Protection</span>
                <span className="badge bg-success">{security?.firewall}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
                <span className="small text-muted">Antivirus Engine</span>
                <span className="small fw-semibold text-dark">{security?.antivirus}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
                <span className="small text-muted">Windows Defender</span>
                <span className="badge bg-success">{security?.defender}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
                <span className="small text-muted">Windows Updates</span>
                <span className="small fw-semibold text-primary">{security?.updates}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center p-2">
                <span className="small text-muted">Drive Encryption</span>
                <span className="badge bg-success">{security?.bitLocker}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Machine Alerts */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaExclamationTriangle className="text-warning" /> Machine Alerts
            </h6>

            {alerts && alerts.length > 0 ? (
              <div className="d-flex flex-column gap-2">
                {alerts.map((a) => (
                  <div key={a.id} className="p-2 border-bottom d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold text-dark small">{a.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>{new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <span className={`badge ${a.severity === 'Critical' ? 'bg-danger' : 'bg-warning text-dark'} small`}>
                      {a.severity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted small">No active alerts on this machine.</div>
            )}
          </div>
        </div>

        {/* Change Timeline */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaHistory className="text-info" /> Change Timeline
            </h6>

            {changes && changes.length > 0 ? (
              <div className="d-flex flex-column gap-2">
                {changes.map((c) => (
                  <div key={c.id} className="p-2 border-bottom">
                    <div className="fw-semibold text-dark small">{c.description}</div>
                    <div className="text-muted d-flex justify-content-between" style={{ fontSize: '0.72rem' }}>
                      <span>Category: {c.category}</span>
                      <span>{new Date(c.detectedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted small">No hardware or software changes logged.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSystemDetails;
