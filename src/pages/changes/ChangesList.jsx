import React, { useState } from 'react';
import { FaCodeBranch, FaSync, FaHdd, FaCube, FaShieldAlt, FaWifi, FaTools, FaServer, FaFlag, FaSearch as FaSearchIcon, FaThumbsUp, FaCheck, FaSlash, FaFilter } from 'react-icons/fa';
import { useChanges, useUpdateChangeStatus } from '../../hooks/useQueries';

const SEVERITIES = ['', 'critical', 'important', 'warning', 'information'];
const STATUSES = ['', 'pending_review', 'investigating', 'approved', 'resolved', 'false_positive'];

function getSeverityColor(severity) {
  switch (severity) {
    case 'critical': return { border: '#EF4444', bg: '#FEF2F2', badge: 'bg-danger', text: '#DC2626' };
    case 'important': return { border: '#F97316', bg: '#FFF7ED', badge: 'bg-warning', text: '#EA580C' };
    case 'warning': return { border: '#F59E0B', bg: '#FFFBEB', badge: 'bg-warning', text: '#D97706' };
    default: return { border: '#3B82F6', bg: '#EFF6FF', badge: 'bg-info', text: '#2563EB' };
  }
}

function getCategoryIcon(category) {
  switch (category) {
    case 'hardware': return <FaHdd className="text-danger" />;
    case 'software': return <FaCube className="text-primary" />;
    case 'security': return <FaShieldAlt className="text-warning" />;
    case 'network': return <FaWifi className="text-purple" />;
    case 'peripheral': return <FaTools className="text-teal" />;
    case 'configuration': return <FaServer className="text-secondary" />;
    default: return <FaCodeBranch className="text-indigo" />;
  }
}

function getChangeTypeStyle(type) {
  if (['added', 'connected', 'enabled'].includes(type)) return 'bg-success-subtle text-success-emphasis';
  if (['removed', 'disconnected', 'disabled'].includes(type)) return 'bg-danger-subtle text-danger-emphasis';
  return 'bg-warning-subtle text-warning-emphasis';
}

function getStatusConfig(status) {
  switch (status) {
    case 'investigating': return { badge: 'bg-purple-subtle text-purple-emphasis', icon: FaSearchIcon, label: 'Investigating' };
    case 'approved': return { badge: 'bg-success-subtle text-success-emphasis', icon: FaThumbsUp, label: 'Approved' };
    case 'resolved': return { badge: 'bg-info-subtle text-info-emphasis', icon: FaCheck, label: 'Resolved' };
    case 'false_positive': return { badge: 'bg-secondary-subtle text-secondary-emphasis', icon: FaSlash, label: 'False Positive' };
    default: return { badge: 'bg-warning-subtle text-warning-emphasis', icon: FaFlag, label: 'Pending Review' };
  }
}

export default function ChangesList() {
  const [category, setCategory] = useState('hardware');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selectedChange, setSelectedChange] = useState(null);

  const qp = { page, per_page: 30 };
  if (category) qp.category = category;
  if (severity) qp.severity = severity;
  if (status) qp.status = status;

  const { data, isLoading: loading, isFetching, refetch } = useChanges(qp);
  const changes = data?.data || [];
  const meta = data?.meta || { total: 0 };

  const statusMutation = useUpdateChangeStatus();
  const [updatingId, setUpdatingId] = useState(null);

  const handleFilterChange = (type, value) => {
    if (type === 'category') setCategory(value);
    if (type === 'severity') setSeverity(value);
    if (type === 'status') setStatus(value);
    setPage(1);
  };

  const handleStatusUpdate = async (changeId, newStatus) => {
    setUpdatingId(changeId);
    try {
      await statusMutation.mutateAsync({ changeId, status: newStatus });
      setSelectedChange(prev => prev?.id === changeId ? { ...prev, status: newStatus } : prev);
    } catch (err) {
      alert('Failed to update status: ' + (err.message || 'Unknown error'));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Hardware Change Monitor</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--dg-text-muted)', margin: 0 }}>
            Track and verify unauthorized hardware modifications detected across all connected machines.
          </p>
        </div>
        <button 
          onClick={() => refetch()} 
          disabled={isFetching} 
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
          style={{ padding: '8px 16px', fontSize: '0.8rem' }}
        >
          <FaSync className={isFetching ? 'spin-icon' : ''} size={11} /> 
          <span>Refresh</span>
        </button>
      </div>

      <div className="card mb-4">
        {/* Filters */}
        <div className="card-body d-flex flex-column gap-3">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <span className="text-muted small fw-semibold d-flex align-items-center gap-1.5" style={{ fontSize: '0.78rem' }}><FaFilter size={11} /> Hardware Type:</span>
            <div className="pill-group flex-wrap">
              {['All', 'hardware', 'storage', 'memory', 'cpu', 'motherboard', 'peripheral'].map(cat => (
                <button key={cat} onClick={() => handleFilterChange('category', cat === 'All' ? '' : cat)}
                  className={`pill-btn ${category === (cat === 'All' ? '' : cat) ? 'active' : ''}`}>
                  {cat === 'All' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="d-flex flex-wrap align-items-center gap-3">
            <span className="text-muted small fw-semibold d-flex align-items-center gap-1.5" style={{ fontSize: '0.78rem' }}><FaFilter size={11} /> Severity:</span>
            <div className="pill-group flex-wrap">
              {['All', ...SEVERITIES.filter(Boolean)].map(sev => (
                <button key={sev} onClick={() => handleFilterChange('severity', sev === 'All' ? '' : sev)}
                  className={`pill-btn ${severity === (sev === 'All' ? '' : sev) ? 'active' : ''}`}>
                  {sev === 'All' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="d-flex flex-wrap align-items-center gap-3">
            <span className="text-muted small fw-semibold d-flex align-items-center gap-1.5" style={{ fontSize: '0.78rem' }}><FaFlag size={11} /> Status:</span>
            <div className="pill-group flex-wrap">
              {['All', ...STATUSES.filter(Boolean)].map(st => (
                <button key={st} onClick={() => handleFilterChange('status', st === 'All' ? '' : st)}
                  className={`pill-btn ${status === (st === 'All' ? '' : st) ? 'active' : ''}`}>
                  {st === 'All' ? 'All' : st.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-muted small">Loading hardware changes...</p>
        </div>
      ) : changes.length > 0 ? (
        <>
          <div className="row g-3">
            {changes.map((c, i) => {
              const sev = getSeverityColor(c.severity);
              const statusCfg = getStatusConfig(c.status);
              const StatusIcon = statusCfg.icon;
              return (
                <div key={c.id || i} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 p-3 cursor-pointer" style={{ borderLeft: `3px solid ${sev.border}` }}
                    onClick={() => setSelectedChange(c)}>
                    <div className="d-flex align-items-start justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '0.9rem' }}>{getCategoryIcon(c.category)}</span>
                        <div>
                          <span className={`badge ${sev.badge} bg-opacity-10 text-dark me-1`}>{c.severity || 'info'}</span>
                          {c.machine && <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>{c.machine.hostname || c.machine.device_name || ''}</small>}
                        </div>
                      </div>
                      <span className={`badge d-flex align-items-center gap-1 ${statusCfg.badge}`} style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                        <StatusIcon className="me-1" size={9} />
                        <span>{statusCfg.label}</span>
                      </span>
                    </div>
                    <h6 className="fw-semibold mb-1 text-truncate" style={{ color: 'var(--dg-text-primary)', fontSize: '0.85rem' }}>{c.item_label || c.item_identifier || 'Change'}</h6>
                    <p className="small text-muted mb-2" style={{ WebkitLineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', fontSize: '0.75rem', lineHeight: 1.4 }}>{c.description || 'No description'}</p>
                    <div className="d-flex align-items-center justify-content-between small" style={{ fontSize: '0.72rem' }}>
                      <span className={`badge ${getChangeTypeStyle(c.change_type)}`}>{c.change_type}</span>
                      <span className="text-muted">{c.detected_at ? new Date(c.detected_at).toLocaleDateString() : '—'}</span>
                    </div>
                    {c.previous_value && c.new_value && (
                      <div className="mt-2 pt-2 small font-mono" style={{ borderTop: '1px solid var(--dg-border-light)', fontSize: '0.7rem' }}>
                        <span className="text-muted text-decoration-line-through">{typeof c.previous_value === 'string' && c.previous_value.length > 25 ? c.previous_value.substring(0, 25) + '...' : c.previous_value}</span>
                        <span className="mx-1 text-muted">→</span>
                        <span className="fw-semibold" style={{ color: 'var(--dg-text-primary)' }}>{typeof c.new_value === 'string' && c.new_value.length > 25 ? c.new_value.substring(0, 25) + '...' : c.new_value}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {meta && (
            <div className="card p-3 mt-4 d-flex flex-row align-items-center justify-content-between">
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>Page {meta.current_page || page} of {meta.last_page || 1} ({meta.total || changes.length} total)</small>
              <div className="dg-pagination">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="page-btn">&lt;</button>
                <button disabled={page >= (meta.last_page || 1)} onClick={() => setPage(p => p + 1)} className="page-btn">&gt;</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card p-5 text-center">
          <div className="mb-3 text-muted" style={{ fontSize: '42px', opacity: 0.3 }}><FaCodeBranch /></div>
          <h6 className="fw-bold mb-2" style={{ color: 'var(--dg-text-primary)' }}>No Hardware Changes Detected</h6>
          <p className="text-muted mb-0 small">All monitored machines have consistent hardware configurations. Any unauthorized modifications will appear here automatically.</p>
        </div>
      )}

      {selectedChange && (
        <div className="modal d-block" onClick={() => setSelectedChange(null)}>
          <div className="modal-dialog modal-dialog-centered modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center gap-3">
                  <span style={{ fontSize: '1.25rem' }}>{getCategoryIcon(selectedChange.category)}</span>
                  <div>
                    <h5 className="modal-title" style={{ color: 'var(--dg-text-primary)', fontSize: '1rem', fontWeight: 700 }}>Change Details</h5>
                    <span className={`badge ${getSeverityColor(selectedChange.severity).badge} bg-opacity-10 text-dark`} style={{ fontSize: '0.65rem' }}>
                      {selectedChange.severity || 'information'}
                    </span>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setSelectedChange(null)} />
              </div>
              <div className="modal-body">
                <h6 className="fw-semibold mb-1" style={{ color: 'var(--dg-text-primary)', fontSize: '0.85rem' }}>{selectedChange.item_label || selectedChange.item_identifier || 'Change Item'}</h6>
                <p className="text-muted small mb-4">{selectedChange.description || 'No description available.'}</p>

                <div className="row g-2 mb-4">
                  <div className="col-6">
                    <div className="p-2.5 rounded border" style={{ background: 'var(--dg-gray-50)' }}>
                      <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Category</small>
                      <span className="fw-semibold" style={{ color: 'var(--dg-text-primary)', fontSize: '0.8rem' }}>{selectedChange.category || '—'}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2.5 rounded border" style={{ background: 'var(--dg-gray-50)' }}>
                      <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Change Type</small>
                      <span className={`badge ${getChangeTypeStyle(selectedChange.change_type)}`} style={{ fontSize: '0.65rem' }}>{selectedChange.change_type || '—'}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2.5 rounded border" style={{ background: 'var(--dg-gray-50)' }}>
                      <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Severity</small>
                      <span className={`badge ${getSeverityColor(selectedChange.severity).badge} bg-opacity-10 text-dark`} style={{ fontSize: '0.65rem' }}>{selectedChange.severity || 'information'}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2.5 rounded border" style={{ background: 'var(--dg-gray-50)' }}>
                      <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Detected At</small>
                      <span className="fw-semibold" style={{ color: 'var(--dg-text-primary)', fontSize: '0.8rem' }}>{selectedChange.detected_at ? new Date(selectedChange.detected_at).toLocaleString() : '—'}</span>
                    </div>
                  </div>
                  {selectedChange.status && (
                    <div className="col-12">
                      <div className="p-2.5 rounded border" style={{ background: 'var(--dg-gray-50)' }}>
                        <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Investigation Status</small>
                        <span className={`badge d-inline-flex align-items-center gap-1 ${getStatusConfig(selectedChange.status).badge}`} style={{ fontSize: '0.65rem' }}>
                          {(() => { const S = getStatusConfig(selectedChange.status); return <><S.icon size={8} /><span className="ms-1">{S.label}</span></>; })()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {(selectedChange.previous_value || selectedChange.new_value) && (
                  <div className="mb-4">
                    <h6 className="fw-semibold mb-2" style={{ color: 'var(--dg-text-primary)', fontSize: '0.8rem' }}>Value Comparison</h6>
                    <div className="row g-2">
                      <div className="col-6">
                        <div className="p-2.5 rounded border font-mono" style={{ background: 'var(--dg-danger-light)', borderColor: 'rgba(239,68,68,0.2)' }}>
                          <small className="fw-semibold text-danger mb-1 d-block" style={{ fontSize: '0.65rem' }}>Previous State</small>
                          <small className="text-dark" style={{ fontSize: '0.72rem' }}>{selectedChange.previous_value || '(none)'}</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2.5 rounded border font-mono" style={{ background: 'var(--dg-success-light)', borderColor: 'rgba(16,185,129,0.2)' }}>
                          <small className="fw-semibold text-success mb-1 d-block" style={{ fontSize: '0.65rem' }}>Current State</small>
                          <small className="text-dark" style={{ fontSize: '0.72rem' }}>{selectedChange.new_value || '(none)'}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-2.5 rounded border mb-3" style={{ background: 'var(--dg-danger-light)', borderColor: 'rgba(239,68,68,0.2)', fontSize: '0.72rem' }}>
                  <small className="fw-semibold text-danger d-block mb-1">Possible Impact</small>
                  <small className="text-danger">Unauthorized hardware changes may violate AMC service terms. Verify with the customer whether this replacement was authorized.</small>
                </div>

                <div className="p-2.5 rounded border mb-4" style={{ background: 'var(--dg-warning-light)', borderColor: 'rgba(245,158,11,0.2)', fontSize: '0.72rem' }}>
                  <small className="fw-semibold text-warning d-block mb-1" style={{ color: 'var(--dg-warning)' }}>Recommended Action</small>
                  <small className="text-dark">{selectedChange.recommendation || 'Investigate the hardware change and verify with the customer if this component replacement was authorized under the AMC agreement.'}</small>
                </div>

                <div>
                  <small className="fw-semibold text-muted d-block mb-2" style={{ fontSize: '0.72rem' }}>Actions</small>
                  <div className="d-flex flex-wrap gap-2">
                    {(!['approved', 'resolved', 'false_positive'].includes(selectedChange.status)) && (
                      <>
                        <button onClick={() => handleStatusUpdate(selectedChange.id, 'approved')} disabled={updatingId === selectedChange.id}
                          className="btn btn-success btn-sm d-flex align-items-center gap-1.5" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                          <FaThumbsUp size={11} /> Approve
                        </button>
                        <button onClick={() => handleStatusUpdate(selectedChange.id, 'investigating')} disabled={updatingId === selectedChange.id}
                          className="btn btn-warning btn-sm d-flex align-items-center gap-1.5 text-white" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                          <FaSearchIcon size={11} /> Investigate
                        </button>
                      </>
                    )}
                    {!['resolved', 'false_positive'].includes(selectedChange.status) && (
                      <button onClick={() => handleStatusUpdate(selectedChange.id, 'resolved')} disabled={updatingId === selectedChange.id}
                        className="btn btn-info btn-sm d-flex align-items-center gap-1.5 text-white" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                        <FaCheck size={11} /> Resolve
                      </button>
                    )}
                    {!['false_positive', 'resolved', 'approved'].includes(selectedChange.status) && (
                      <button onClick={() => handleStatusUpdate(selectedChange.id, 'false_positive')} disabled={updatingId === selectedChange.id}
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                        <FaSlash size={11} /> False Positive
                      </button>
                    )}
                    {updatingId === selectedChange.id && <span className="small text-muted align-self-center">Updating...</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
