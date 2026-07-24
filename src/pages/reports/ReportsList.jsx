import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaFileAlt,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaSearch,
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaTrash,
  FaDownload,
  FaTimes
} from 'react-icons/fa';
import { getReports, generateReport, downloadReport, deleteReport, downloadAmcHealthSummaryReport, downloadAssetInventoryReport } from '../../services/reports';

const TYPE_OPTIONS = ['health', 'inventory', 'security', 'custom'];
const FORMAT_OPTIONS = ['pdf', 'excel', 'csv'];

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({ total: 0, health: 0, inventory: 0, security: 0, custom: 0, pdf: 0, excel: 0, csv: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [typeFilter, setTypeFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genType, setGenType] = useState('health');
  const [genFormat, setGenFormat] = useState('pdf');
  const [genFilters, setGenFilters] = useState('');
  const [generating, setGenerating] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [downloading, setDownloading] = useState(null);

  const [showAmcModal, setShowAmcModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [assetCompanyId, setAssetCompanyId] = useState('');
  const [assetMachineId, setAssetMachineId] = useState('');
  const [assetPlan, setAssetPlan] = useState('');
  const [assetDateFrom, setAssetDateFrom] = useState('');
  const [assetDateTo, setAssetDateTo] = useState('');
  const [generatingAsset, setGeneratingAsset] = useState(false);
  const [assetSuccessMessage, setAssetSuccessMessage] = useState('');
  const [assetErrorMessage, setAssetErrorMessage] = useState('');

  const handleGenerateAsset = async (e) => {
    e.preventDefault();
    setGeneratingAsset(true);
    setAssetSuccessMessage('');
    setAssetErrorMessage('');
    try {
      const params = {};
      if (assetCompanyId) {
        params.companyId = assetCompanyId;
        params.customerId = assetCompanyId;
      }
      if (assetMachineId) {
        params.machineId = assetMachineId;
      }
      if (assetPlan) params.amcPlan = assetPlan;
      if (assetDateFrom) params.dateFrom = new Date(assetDateFrom).toISOString();
      if (assetDateTo) params.dateTo = new Date(assetDateTo).toISOString();

      const res = await downloadAssetInventoryReport(params);
      
      let filename = `Asset_Inventory_${assetCompanyId || 'Report'}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.pdf`;
      const disposition = res.headers ? res.headers['content-disposition'] : null;
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setAssetSuccessMessage('Asset Inventory Report generated and downloaded successfully!');
      setTimeout(() => {
        setShowAssetModal(false);
        setAssetSuccessMessage('');
        setAssetCompanyId('');
        setAssetMachineId('');
        setAssetPlan('');
        setAssetDateFrom('');
        setAssetDateTo('');
      }, 2000);
    } catch (err) {
      console.error('Failed to generate Asset Inventory:', err);
      setAssetErrorMessage('Failed to generate report. Please ensure target exists and you have administrator permissions.');
    } finally {
      setGeneratingAsset(false);
    }
  };
  const [amcCompanyId, setAmcCompanyId] = useState('');
  const [amcPlan, setAmcPlan] = useState('');
  const [amcDateFrom, setAmcDateFrom] = useState('');
  const [amcDateTo, setAmcDateTo] = useState('');
  const [generatingAmc, setGeneratingAmc] = useState(false);
  const [amcSuccessMessage, setAmcSuccessMessage] = useState('');
  const [amcErrorMessage, setAmcErrorMessage] = useState('');

  const handleGenerateAmc = async (e) => {
    e.preventDefault();
    setGeneratingAmc(true);
    setAmcSuccessMessage('');
    setAmcErrorMessage('');
    try {
      const params = {};
      if (amcCompanyId) {
        params.companyId = amcCompanyId;
        params.customerId = amcCompanyId;
      }
      if (amcPlan) params.amcPlan = amcPlan;
      if (amcDateFrom) params.dateFrom = new Date(amcDateFrom).toISOString();
      if (amcDateTo) params.dateTo = new Date(amcDateTo).toISOString();

      const res = await downloadAmcHealthSummaryReport(params);
      
      let filename = `AMC_Health_Summary_${amcCompanyId || 'Report'}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.pdf`;
      const disposition = res.headers ? res.headers['content-disposition'] : null;
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setAmcSuccessMessage('AMC Health Summary Report generated and downloaded successfully!');
      setTimeout(() => {
        setShowAmcModal(false);
        setAmcSuccessMessage('');
        setAmcCompanyId('');
        setAmcPlan('');
        setAmcDateFrom('');
        setAmcDateTo('');
      }, 2000);
    } catch (err) {
      console.error('Failed to generate AMC Health Summary:', err);
      setAmcErrorMessage('Failed to generate report. Please ensure the target Customer ID exists and you have administrator permissions.');
    } finally {
      setGeneratingAmc(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, formatFilter, searchFilter]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: currentPage, per_page: 10 };
      if (typeFilter) params.type = typeFilter;
      if (formatFilter) params.format = formatFilter;
      if (searchFilter) params.search = searchFilter;
      const res = await getReports(params);
      // The api.js interceptor already unwraps response.data for non-blob responses
      // res could be: { data: [...], total: N, last_page: N } (new format)
      //            or: { success: true, data: [...] } (ApiResponse wrapper)
      const d = res?.data ?? res;
      const list = Array.isArray(d) ? d : (d?.data ?? d ?? []);
      const reportList = Array.isArray(list) ? list : [];
      setReports(reportList);
      setLastPage(d?.last_page || res?.last_page || 1);
      const total = d?.total || res?.total || reportList.length;
      const byType = { health: 0, inventory: 0, security: 0, custom: 0 };
      const byFormat = { pdf: 0, excel: 0, csv: 0 };
      reportList.forEach(r => {
        if (r.type && byType[r.type] !== undefined) byType[r.type]++;
        if (r.format && byFormat[r.format] !== undefined) byFormat[r.format]++;
      });
      setSummary({ total, ...byType, ...byFormat });
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, typeFilter, formatFilter, searchFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      let filters = null;
      if (genFilters.trim()) {
        try { filters = JSON.parse(genFilters); } catch { filters = genFilters.trim(); }
      }
      await generateReport({ type: genType, format: genFormat, filters });
      setShowGenerateModal(false);
      setGenFilters('');
      setCurrentPage(1);
      await fetchReports();
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (report) => {
    const id = typeof report === 'object' ? report.id : report;
    const fmt = typeof report === 'object' ? (report.format || 'pdf') : 'pdf';
    setDownloading(id);
    try {
      const res = await downloadReport(id);
      // downloadReport uses responseType: 'blob', so the interceptor returns the full response
      const blobData = res?.data ?? res;
      const blob = blobData instanceof Blob ? blobData : new Blob([blobData], { type: 'application/pdf' });

      // Try to extract filename from content-disposition header
      let filename = `report-${id}.${fmt}`;
      const disposition = res?.headers?.['content-disposition'];
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=(['"]?)([^'"\n;]+)\1/;
        const matches = filenameRegex.exec(disposition);
        if (matches && matches[2]) {
          filename = matches[2];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download report:', err);
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteReport(id);
      setDeleteConfirm(null);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete report:', err);
    } finally {
      setDeleting(false);
    }
  };

  const summaryCards = [
    { title: 'Total Reports', value: summary.total, icon: <FaFileAlt />, color: 'primary', bg: 'e7f1ff' },
    { title: 'Health Reports', value: summary.health, icon: <FaCalendarDay />, color: 'success', bg: 'd1e7dd' },
    { title: 'Inventory Reports', value: summary.inventory, icon: <FaCalendarWeek />, color: 'warning', bg: 'fff3cd' },
    { title: 'Security Reports', value: summary.security, icon: <FaCalendarAlt />, color: 'danger', bg: 'f8d7da' },
  ];

  const formatIcon = (fmt) => {
    switch (fmt) {
      case 'pdf': return <FaFilePdf className="text-danger" />;
      case 'excel': return <FaFileExcel className="text-success" />;
      case 'csv': return <FaFileCsv className="text-primary" />;
      default: return <FaFileAlt className="text-secondary" />;
    }
  };

  const typeBadge = (type) => {
    const colors = {
      health: 'bg-success bg-opacity-10 text-success border-success',
      inventory: 'bg-warning bg-opacity-10 text-warning border-warning',
      security: 'bg-danger bg-opacity-10 text-danger border-danger',
      custom: 'bg-info bg-opacity-10 text-info border-info',
    };
    return <span className={`badge ${colors[type] || 'bg-secondary bg-opacity-10 text-secondary border-secondary'} border`}>{type}</span>;
  };

  return (
    <div className="container-fluid p-0">
      {/* Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>System Reports</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--dg-text-muted)', margin: 0 }}>
            Generate, schedule, download and manage system health, security, and hardware reports.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={() => setShowAmcModal(true)} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
            <FaFilePdf size={12} />
            <span>Generate AMC Health Summary</span>
          </button>
          <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => setShowAssetModal(true)} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
            <FaFilePdf size={12} />
            <span>Generate Asset Inventory</span>
          </button>
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowGenerateModal(true)} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
            <FaFileAlt size={12} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {summaryCards.map((card, idx) => (
          <div className="col-12 col-sm-6 col-xl-3" key={idx}>
            <div className="summary-stat-card">
              <div className="summary-card-header">
                <div className={`summary-icon-wrapper icon-${card.color}`}>
                  {card.icon}
                </div>
                <span>{card.title}</span>
              </div>
              <div className="summary-card-value">{card.value}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--dg-text-muted)' }}>
                System generated report count
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-4">
        {/* Filters */}
        <div className="card-body border-bottom border-light">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-3">
              <label className="form-label">Report Type</label>
              <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                {TYPE_OPTIONS.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Format</label>
              <select className="form-select" value={formatFilter} onChange={e => setFormatFilter(e.target.value)}>
                <option value="">All Formats</option>
                {FORMAT_OPTIONS.map(f => (
                  <option key={f} value={f}>{f.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Search Reports</label>
              <div className="position-relative">
                <FaSearch className="position-absolute text-muted" style={{ top: '50%', left: '12px', transform: 'translateY(-50%)', fontSize: '0.82rem' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by generated user..."
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <h6 className="text-danger mb-1 fw-bold">Error Loading Reports</h6>
              <p className="text-muted small mb-3">{error}</p>
              <button className="btn btn-outline-secondary btn-sm" onClick={fetchReports}>Retry</button>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-5">
              <FaFileAlt className="text-muted mb-3" style={{ fontSize: '42px', opacity: 0.3 }} />
              <h6 className="fw-bold mb-1" style={{ color: 'var(--dg-text-primary)' }}>No Reports Found</h6>
              <p className="text-muted small">No reports match the current filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th className="ps-4">Report ID</th>
                    <th>Type</th>
                    <th>Format</th>
                    <th>Generated By</th>
                    <th>Generated At</th>
                    <th className="pe-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td className="ps-4 text-muted font-mono" style={{ fontSize: '0.78rem' }}>#{report.id}</td>
                      <td>{typeBadge(report.type)}</td>
                      <td>
                        <span className="d-inline-flex align-items-center gap-1.5 fw-semibold" style={{ fontSize: '0.8rem' }}>
                          {formatIcon(report.format)} {report.format.toUpperCase()}
                        </span>
                      </td>
                      <td className="fw-semibold">{report.generated_by || '—'}</td>
                      <td className="text-muted">
                        {report.generated_at ? new Date(report.generated_at).toLocaleString() : '—'}
                      </td>
                      <td className="pe-4 text-end">
                        <div className="d-inline-flex gap-2">
                          <button
                            className="action-btn"
                            title="Download Report"
                            onClick={() => handleDownload(report.id)}
                            disabled={downloading === report.id}
                          >
                            {downloading === report.id ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              <FaDownload />
                            )}
                          </button>
                          <button
                            className="action-btn danger"
                            title="Delete Report"
                            onClick={() => setDeleteConfirm(report.id)}
                          >
                            <FaTrash />
                          </button>
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
        {lastPage > 1 && !loading && !error && (
          <div className="card-footer bg-transparent py-3 border-top border-light d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              Page {currentPage} of {lastPage}
            </span>
            <div className="dg-pagination">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                &lt;
              </button>
              {Array.from({ length: lastPage }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
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

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div
          className="modal d-block"
          onClick={() => setShowGenerateModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '460px' }}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Generate New Report</h5>
                <button className="btn-close" onClick={() => setShowGenerateModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Report Type</label>
                  <select className="form-select" value={genType} onChange={e => setGenType(e.target.value)}>
                    {TYPE_OPTIONS.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Format</label>
                  <select className="form-select" value={genFormat} onChange={e => setGenFormat(e.target.value)}>
                    {FORMAT_OPTIONS.map(f => (
                      <option key={f} value={f}>{f.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">
                    Filters <span className="text-muted">(optional JSON)</span>
                  </label>
                  <textarea
                    className="form-control font-mono"
                    rows={3}
                    placeholder='e.g. {"date_from": "2024-01-01"}'
                    value={genFilters}
                    onChange={e => setGenFilters(e.target.value)}
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowGenerateModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
                  {generating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="modal d-block"
          onClick={() => !deleting && setDeleteConfirm(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '380px' }}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button className="btn-close" onClick={() => setDeleteConfirm(null)} disabled={deleting} />
              </div>
              <div className="modal-body">
                <p className="text-muted mb-0 small">Are you sure you want to delete this report? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setDeleteConfirm(null)} disabled={deleting}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate AMC Health Summary Modal */}
      {showAmcModal && (
        <div
          className="modal d-block"
          onClick={() => !generatingAmc && setShowAmcModal(false)}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '480px' }}
          >
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white py-3">
                <h5 className="modal-title fw-bold" style={{ fontSize: '1.1rem' }}>Generate AMC Health Summary</h5>
                <button 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowAmcModal(false)} 
                  disabled={generatingAmc}
                />
              </div>
              <form onSubmit={handleGenerateAmc}>
                <div className="modal-body p-4">
                  {amcSuccessMessage && (
                    <div className="alert alert-success border-0 small py-2 mb-3" role="alert">
                      {amcSuccessMessage}
                    </div>
                  )}
                  {amcErrorMessage && (
                    <div className="alert alert-danger border-0 small py-2 mb-3" role="alert">
                      {amcErrorMessage}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Customer / Company ID</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 1"
                      value={amcCompanyId}
                      onChange={e => setAmcCompanyId(e.target.value)}
                      disabled={generatingAmc}
                      min="1"
                    />
                    <div className="form-text text-muted" style={{ fontSize: '0.72rem' }}>
                      Defaults to your company if left blank.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">AMC Plan Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Gold Premium Support"
                      value={amcPlan}
                      onChange={e => setAmcPlan(e.target.value)}
                      disabled={generatingAmc}
                    />
                    <div className="form-text text-muted" style={{ fontSize: '0.72rem' }}>
                      Overrides current plan label if specified.
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Date From</label>
                      <input
                        type="date"
                        className="form-control"
                        value={amcDateFrom}
                        onChange={e => setAmcDateFrom(e.target.value)}
                        disabled={generatingAmc}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Date To</label>
                      <input
                        type="date"
                        className="form-control"
                        value={amcDateTo}
                        onChange={e => setAmcDateTo(e.target.value)}
                        disabled={generatingAmc}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-top-0 py-3">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-sm" 
                    onClick={() => setShowAmcModal(false)} 
                    disabled={generatingAmc}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-sm d-flex align-items-center gap-2" 
                    disabled={generatingAmc}
                  >
                    {generatingAmc ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <FaFilePdf />
                        <span>Generate & Download</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Generate Asset Inventory Modal */}
      {showAssetModal && (
        <div
          className="modal d-block"
          onClick={() => !generatingAsset && setShowAssetModal(false)}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '480px' }}
          >
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-secondary text-white py-3">
                <h5 className="modal-title fw-bold" style={{ fontSize: '1.1rem' }}>Generate Asset Inventory</h5>
                <button 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowAssetModal(false)} 
                  disabled={generatingAsset}
                />
              </div>
              <form onSubmit={handleGenerateAsset}>
                <div className="modal-body p-4">
                  {assetSuccessMessage && (
                    <div className="alert alert-success border-0 small py-2 mb-3" role="alert">
                      {assetSuccessMessage}
                    </div>
                  )}
                  {assetErrorMessage && (
                    <div className="alert alert-danger border-0 small py-2 mb-3" role="alert">
                      {assetErrorMessage}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Customer / Company ID</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 1"
                      value={assetCompanyId}
                      onChange={e => setAssetCompanyId(e.target.value)}
                      disabled={generatingAsset}
                      min="1"
                    />
                    <div className="form-text text-muted" style={{ fontSize: '0.72rem' }}>
                      Defaults to your company if left blank.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Specific Machine Database ID (Optional)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 15"
                      value={assetMachineId}
                      onChange={e => setAssetMachineId(e.target.value)}
                      disabled={generatingAsset}
                      min="1"
                    />
                    <div className="form-text text-muted" style={{ fontSize: '0.72rem' }}>
                      Leave blank to include all monitored systems.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">AMC Plan Name Override</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Platinum IT Support"
                      value={assetPlan}
                      onChange={e => setAssetPlan(e.target.value)}
                      disabled={generatingAsset}
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Date From</label>
                      <input
                        type="date"
                        className="form-control"
                        value={assetDateFrom}
                        onChange={e => setAssetDateFrom(e.target.value)}
                        disabled={generatingAsset}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Date To</label>
                      <input
                        type="date"
                        className="form-control"
                        value={assetDateTo}
                        onChange={e => setAssetDateTo(e.target.value)}
                        disabled={generatingAsset}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-top-0 py-3">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-sm" 
                    onClick={() => setShowAssetModal(false)} 
                    disabled={generatingAsset}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-secondary btn-sm d-flex align-items-center gap-2" 
                    disabled={generatingAsset}
                  >
                    {generatingAsset ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <FaFilePdf />
                        <span>Generate & Download</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsList;
