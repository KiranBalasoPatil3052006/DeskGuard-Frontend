/**
 * Alerts List Page
 *
 * Displays all alerts with filtering by severity and status.
 * Provides acknowledge and resolve actions directly from the list.
 * Includes summary cards, search, and pagination.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSync, FaSearch, FaBell, FaExclamationCircle,
  FaExclamationTriangle, FaCheckCircle
} from 'react-icons/fa';
import { useQueryClient } from '@tanstack/react-query';
import { useAlerts, useAcknowledgeAlert, useResolveAlert } from '../../hooks/useQueries';

const AlertsList = () => {
  const queryClient = useQueryClient();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [resolveNote, setResolveNote] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilter, severityFilter, statusFilter]);

  const params = { page: currentPage, per_page: 10 };
  if (severityFilter) params.severity = severityFilter;
  if (statusFilter) params.status = statusFilter;
  if (searchFilter) params.search = searchFilter;

  const { data: alertsData, isLoading: loading, isFetching: isRefreshing } = useAlerts(params);
  const alerts = alertsData?.data || [];
  const meta = alertsData?.meta || {};
  const lastPage = meta?.last_page || 1;
  const summary = {
    total: meta?.total || alerts.length,
    critical: meta?.critical_count || alerts.filter(a => a.severity === 'critical').length,
    warning: meta?.warning_count || alerts.filter(a => a.severity === 'warning').length,
    resolved: meta?.resolved_count || alerts.filter(a => a.status === 'resolved').length,
  };

  const acknowledgeMutation = useAcknowledgeAlert();
  const resolveMutation = useResolveAlert();

  const handleAcknowledge = async (alertId) => {
    setActionLoading(alertId);
    try {
      await acknowledgeMutation.mutateAsync(alertId);
      setSelectedAlert(prev => prev?.id === alertId ? { ...prev, status: 'acknowledged' } : prev);
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (alertId) => {
    setActionLoading(alertId);
    try {
      await resolveMutation.mutateAsync({ id: alertId, note: resolveNote });
      setSelectedAlert(prev => prev?.id === alertId ? { ...prev, status: 'resolved' } : prev);
      setShowResolveModal(null);
      setResolveNote('');
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getSeverityBadge = (severity) => {
    const colors = { critical: 'bg-danger', warning: 'bg-warning text-dark', info: 'bg-info' };
    return <span className={`badge ${colors[severity] || 'bg-secondary'}`}>{severity}</span>;
  };

  const getStatusBadge = (status) => {
    const colors = { open: 'bg-danger', acknowledged: 'bg-warning text-dark', resolved: 'bg-success' };
    return <span className={`badge ${colors[status] || 'bg-secondary'}`}>{status}</span>;
  };

  return (
    <div className="container-fluid p-0">
      {/* Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>System Alerts</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--dg-text-muted)', margin: 0 }}>
            Acknowledge and resolve real-time threshold warnings from hosts.
          </p>
        </div>
        <div>
          <button 
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['alerts'] })} 
            disabled={isRefreshing}
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          >
            <FaSync className={isRefreshing ? 'spin-icon' : ''} size={11} /> 
            <span>Refresh Alerts</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Alerts', value: summary.total, icon: <FaBell />, color: 'blue' },
          { label: 'Critical Severity', value: summary.critical, icon: <FaExclamationCircle />, color: 'red' },
          { label: 'Warning Severity', value: summary.warning, icon: <FaExclamationTriangle />, color: 'orange' },
          { label: 'Resolved Alerts', value: summary.resolved, icon: <FaCheckCircle />, color: 'green' },
        ].map((card, idx) => (
          <div className="col-12 col-sm-6 col-xl-3" key={idx}>
            <div className="summary-stat-card">
              <div className="summary-card-header">
                <div className={`summary-icon-wrapper icon-${card.color}`}>
                  {card.icon}
                </div>
                <span>{card.label}</span>
              </div>
              <div className="summary-card-value">{card.value}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--dg-text-muted)' }}>
                Recorded alert count
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Card */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            {/* Search */}
            <div className="col-12 col-md-6">
              <label className="form-label">Search Alerts</label>
              <div className="position-relative">
                <FaSearch className="position-absolute text-muted" style={{ top: '50%', left: '12px', transform: 'translateY(-50%)', fontSize: '0.82rem' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search alerts..." 
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
              </div>
            </div>
            {/* Severity Filter */}
            <div className="col-6 col-md-3">
              <label className="form-label">Severity</label>
              <select
                className="form-select"
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>
            {/* Status Filter */}
            <div className="col-6 col-md-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Table Card */}
      <div className="card mb-4">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-5">
              <FaCheckCircle className="text-success mb-3" style={{ fontSize: '42px', opacity: 0.8 }} />
              <h6 className="fw-bold" style={{ color: 'var(--dg-text-primary)' }}>No Alerts Pending</h6>
              <p className="text-muted small">All clear! No warnings match the current filtering parameters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th className="ps-4">Severity</th>
                    <th>Alert Details</th>
                    <th>Machine Host</th>
                    <th>Status</th>
                    <th>Triggered At</th>
                    <th className="pe-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map(alert => (
                    <tr
                      key={alert.id}
                      onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
                      style={{ cursor: 'pointer' }}
                      className={selectedAlert?.id === alert.id ? 'table-active' : ''}
                    >
                      <td className="ps-4">
                        <span className={`badge ${alert.severity === 'critical' ? 'badge-critical' : alert.severity === 'warning' ? 'badge-warning' : 'badge-info'}`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{alert.title}</div>
                        <div className="text-muted small text-truncate mt-0.5" style={{ maxWidth: '240px', fontSize: '0.75rem' }}>
                          {alert.description}
                        </div>
                      </td>
                      <td>
                        {alert.machine ? (
                          <Link
                            to={`/machines/${alert.machine_id || alert.machine?.id}`}
                            className="fw-semibold text-primary text-decoration-none"
                            onClick={e => e.stopPropagation()}
                            style={{ fontSize: '0.82rem' }}
                          >
                            {alert.machine?.device_name || alert.machine?.hostname || 'View Machine'}
                          </Link>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${alert.status === 'resolved' ? 'badge-online' : alert.status === 'acknowledged' ? 'badge-warning' : 'badge-critical'}`}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="text-muted" style={{ fontSize: '0.78rem' }}>
                        {alert.created_at ? new Date(alert.created_at).toLocaleString() : '—'}
                      </td>
                      <td className="pe-4 text-end" onClick={e => e.stopPropagation()}>
                        <div className="d-inline-flex gap-2">
                          {alert.status === 'open' && (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleAcknowledge(alert.id)}
                              disabled={actionLoading === alert.id}
                              style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                            >
                              {actionLoading === alert.id ? '...' : 'Acknowledge'}
                            </button>
                          )}
                          {alert.status !== 'resolved' && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => { setShowResolveModal(alert.id); setResolveNote(''); }}
                              disabled={actionLoading === alert.id}
                              style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                            >
                              Resolve
                            </button>
                          )}
                          {alert.status === 'resolved' && (
                            <span className="text-muted small px-2">Closed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {lastPage > 1 && !loading && (
          <div className="card-footer bg-transparent border-top border-light d-flex justify-content-between align-items-center py-3">
            <span className="text-muted small">Page {currentPage} of {lastPage}</span>
            <div className="dg-pagination">
              <button 
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                &lt;
              </button>
              {Array.from({ length: lastPage }, (_, i) => i + 1).map(p => (
                <button 
                  key={p} 
                  className={`page-btn ${p === currentPage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}
              <button 
                className="page-btn"
                disabled={currentPage === lastPage}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resolve Dialog Modal */}
      {showResolveModal && (
        <div className="modal d-block" onClick={() => setShowResolveModal(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Resolve Alert</h5>
                <button type="button" className="btn-close" onClick={() => setShowResolveModal(null)} />
              </div>
              <div className="modal-body">
                <label className="form-label">Resolution Note</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Resolution details, actions taken..."
                  value={resolveNote}
                  onChange={e => setResolveNote(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowResolveModal(null)}>Cancel</button>
                <button 
                  className="btn btn-success" 
                  onClick={() => handleResolve(showResolveModal)}
                  disabled={actionLoading === showResolveModal}
                >
                  {actionLoading === showResolveModal ? 'Resolving...' : 'Confirm Resolve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Detail Dialog Modal */}
      {selectedAlert && (
        <div className="modal d-block" onClick={() => setSelectedAlert(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Alert Details</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedAlert(null)} />
              </div>
              <div className="modal-body">
                <div className="d-flex flex-column gap-3">
                  {[
                    { label: 'Title', value: selectedAlert.title },
                    { label: 'Severity', value: <span className={`badge ${selectedAlert.severity === 'critical' ? 'badge-critical' : selectedAlert.severity === 'warning' ? 'badge-warning' : 'badge-info'}`}>{selectedAlert.severity}</span> },
                    { label: 'Description', value: <div className="text-muted font-normal" style={{ fontSize: '0.78rem', whiteSpace: 'pre-line' }}>{selectedAlert.description || '—'}</div> },
                    { label: 'Status', value: <span className={`badge ${selectedAlert.status === 'resolved' ? 'badge-online' : selectedAlert.status === 'acknowledged' ? 'badge-warning' : 'badge-critical'}`}>{selectedAlert.status}</span> },
                    { label: 'Machine Host', value: selectedAlert.machine ? <Link to={`/machines/${selectedAlert.machine_id || selectedAlert.machine?.id}`} className="fw-semibold text-primary text-decoration-none" onClick={() => setSelectedAlert(null)}>{selectedAlert.machine?.device_name || selectedAlert.machine?.hostname || 'View Machine'}</Link> : '—' },
                    { label: 'Triggered At', value: selectedAlert.created_at ? new Date(selectedAlert.created_at).toLocaleString() : '—' },
                  ].map((row, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center py-1.5" style={{ borderBottom: idx < 5 ? '1px solid var(--dg-border-light)' : 'none' }}>
                      <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500 }}>{row.label}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dg-text-primary)' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary w-100" onClick={() => setSelectedAlert(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsList;
