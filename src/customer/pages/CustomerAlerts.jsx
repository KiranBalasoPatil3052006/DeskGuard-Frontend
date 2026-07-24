import React, { useState, useEffect } from 'react';
import {
  FaBell,
  FaFilter,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaSync
} from 'react-icons/fa';
import { getCustomerAlerts } from '../services/customerApi';

const CustomerAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState('All');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await getCustomerAlerts({ page, per_page: 15, severity });
      const data = res?.data?.data || res?.data || res || [];
      const paginationMeta = res?.data?.meta || res?.meta || { currentPage: page, totalPages: 1, totalCount: data.length };
      setAlerts(Array.isArray(data) ? data : []);
      setMeta(paginationMeta);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [page, severity]);

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">My System Alerts</h4>
          <p className="text-muted small mb-0">Read-only security and performance alerts triggered across your AMC computers.</p>
        </div>
        <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2" onClick={fetchAlerts}>
          <FaSync className={loading ? 'spin-icon' : ''} /> Refresh
        </button>
      </div>

      {/* Toolbar */}
      <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: '12px' }}>
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-muted"><FaFilter /></span>
              <select
                className="form-select bg-light"
                value={severity}
                onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical Only</option>
                <option value="Warning">Warning Only</option>
                <option value="Information">Information Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : alerts.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th>System</th>
                    <th>Alert Description</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((a) => (
                    <tr key={a.id} style={{ fontSize: '0.85rem' }}>
                      <td className="fw-semibold text-dark">{a.machine}</td>
                      <td>{a.alert}</td>
                      <td>
                        <span className={`badge ${a.severity === 'Critical' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                          {a.severity}
                        </span>
                      </td>
                      <td><span className="badge bg-light text-dark border">{a.status}</span></td>
                      <td className="text-muted small">{new Date(a.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta.totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center pt-3 mt-3 border-top">
                <span className="small text-muted">Page {meta.currentPage} of {meta.totalPages}</span>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><FaChevronLeft /> Prev</button>
                  <button className="btn btn-outline-secondary btn-sm" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>Next <FaChevronRight /></button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-5 text-muted">
            <FaBell className="fs-1 opacity-50 mb-2" />
            <h6>No system alerts found</h6>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerAlerts;
