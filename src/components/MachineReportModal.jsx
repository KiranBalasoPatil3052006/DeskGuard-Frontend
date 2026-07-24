import React, { useState } from 'react';
import {
  FaFilePdf, FaTimes, FaHeartbeat, FaMicrochip, FaTachometerAlt,
  FaSyncAlt, FaExclamationTriangle, FaUserCheck, FaListAlt, FaCalendarAlt
} from 'react-icons/fa';
import { generateMachineReport } from '../services/reports';

const REPORT_TYPES = [
  { id: 'health', name: 'Machine Health Report', desc: 'Overall status, resource health, security, alerts & changes summary', icon: FaHeartbeat },
  { id: 'hardware', name: 'Hardware Report', desc: 'Detailed CPU, RAM, GPU, storage, motherboard, battery, peripherals', icon: FaMicrochip },
  { id: 'performance', name: 'Performance Report', desc: 'Resource usage history, CPU/RAM/Disk averages, peaks, timeline', icon: FaTachometerAlt },
  { id: 'changes', name: 'Change Timeline Report', desc: 'Hardware, software, security, USB & config change history', icon: FaSyncAlt },
  { id: 'alerts', name: 'Alert History Report', desc: 'Complete alert history, lifecycle status, severity breakdown', icon: FaExclamationTriangle },
  { id: 'activity', name: 'Activity Report', desc: 'User logon/logoff events, sessions, USB connect/disconnect log', icon: FaUserCheck },
  { id: 'systemlog', name: 'System Log Report', desc: 'Windows event logs, service statuses, auto-start programs', icon: FaListAlt },
];

const MachineReportModal = ({ show, onClose, machine, status }) => {
  const [selectedType, setSelectedType] = useState('health');
  const [dateRangePreset, setDateRangePreset] = useState('last30');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!show || !machine) return null;

  const cs = status || machine?.current_status || {};
  const machineName = machine.device_name || machine.hostname || `Machine ${machine.id}`;
  const currentUser = cs.current_user || machine.current_user || '—';
  const os = machine.operating_system || '—';
  const isOnline = machine.is_online;

  const calculateDates = () => {
    const today = new Date();
    let fromDate = new Date();

    if (dateRangePreset === 'today') {
      fromDate.setHours(0, 0, 0, 0);
    } else if (dateRangePreset === 'last7') {
      fromDate.setDate(today.getDate() - 7);
    } else if (dateRangePreset === 'last30') {
      fromDate.setDate(today.getDate() - 30);
    } else if (dateRangePreset === 'custom') {
      const fromObj = customFrom ? new Date(customFrom) : null;
      const toObj = customTo ? new Date(customTo) : null;
      return {
        date_from: fromObj && !isNaN(fromObj.getTime()) ? fromObj.toISOString() : undefined,
        date_to: toObj && !isNaN(toObj.getTime()) ? toObj.toISOString() : undefined,
      };
    }

    return {
      date_from: fromDate.toISOString(),
      date_to: today.toISOString(),
    };
  };

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg(null);

    const targetMachineId = machine?.id || machine?.machine_id || machine?.Id;
    if (!targetMachineId) {
      setErrorMsg('Invalid machine ID. Please reload the page and try again.');
      setLoading(false);
      return;
    }

    try {
      const { date_from, date_to } = calculateDates();
      const params = {
        machineId: targetMachineId,
        reportType: selectedType,
      };

      if (date_from) params.dateFrom = date_from;
      if (date_to) params.dateTo = date_to;

      const res = await generateMachineReport(params);

      // Extract blob safely from axios response
      const rawData = res?.data ?? res;
      const blob = rawData instanceof Blob ? rawData : new Blob([rawData], { type: 'application/pdf' });

      // Trigger automatic PDF download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanType = selectedType.replace('_', '-');
      const cleanName = (machine.device_name || machine.hostname || `Machine_${targetMachineId}`).replace(/[^a-zA-Z0-9_-]/g, '_');
      link.setAttribute('download', `Report_${cleanName}_${cleanType}_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      console.error('Report generation failed:', err);
      let message = 'Failed to generate report. Please try again.';

      let blobToRead = null;
      if (err instanceof Blob) {
        blobToRead = err;
      } else if (err?.response?.data instanceof Blob) {
        blobToRead = err.response.data;
      }

      if (blobToRead) {
        try {
          const text = await blobToRead.text();
          if (text) {
            try {
              const parsed = JSON.parse(text);
              if (parsed?.message) {
                message = parsed.message;
              } else if (parsed?.error) {
                message = parsed.error;
              } else if (parsed?.title) {
                message = parsed.title;
              } else if (parsed?.errors) {
                const firstKey = Object.keys(parsed.errors)[0];
                if (firstKey && parsed.errors[firstKey]?.[0]) {
                  message = `${firstKey}: ${parsed.errors[firstKey][0]}`;
                }
              } else {
                message = text.slice(0, 200);
              }
            } catch {
              message = text.slice(0, 200);
            }
          }
        } catch {
          /* use fallback message */
        }
      } else if (typeof err === 'string') {
        message = err;
      } else if (err?.message) {
        message = err.message;
      }

      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          {/* Header */}
          <div className="modal-header text-white px-4 py-3" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)' }}>
            <div className="d-flex align-items-center gap-2">
              <FaFilePdf size={20} />
              <h5 className="modal-title fw-bold mb-0" style={{ fontSize: '1.1rem' }}>Generate Machine Report</h5>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={loading} aria-label="Close" />
          </div>

          <div className="modal-body p-4" style={{ backgroundColor: 'var(--dg-bg-body, #F8FAFC)', color: 'var(--dg-text-primary)' }}>
            {/* Machine Summary Bar */}
            <div className="card border-0 p-3 mb-3 shadow-sm" style={{ borderRadius: '8px', background: 'var(--dg-bg-card, #FFFFFF)' }}>
              <div className="row g-2 align-items-center text-center text-md-start">
                <div className="col-12 col-md-3">
                  <div className="text-muted small fw-semibold">Machine Name</div>
                  <div className="fw-bold text-truncate" title={machineName}>{machineName}</div>
                </div>
                <div className="col-6 col-md-2">
                  <div className="text-muted small fw-semibold">Machine ID</div>
                  <div className="small font-monospace text-truncate">{machine.machine_uid || machine.id}</div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="text-muted small fw-semibold">Operating System</div>
                  <div className="small text-truncate" title={os}>{os}</div>
                </div>
                <div className="col-6 col-md-2">
                  <div className="text-muted small fw-semibold">Current User</div>
                  <div className="small text-truncate">{currentUser}</div>
                </div>
                <div className="col-6 col-md-2 text-end">
                  <div className="text-muted small fw-semibold">Status</div>
                  <span className={`badge ${isOnline ? 'bg-success' : 'bg-secondary'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="alert alert-danger py-2 px-3 mb-3 small d-flex align-items-center gap-2">
                <FaExclamationTriangle className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Report Type Selection */}
            <h6 className="fw-bold mb-2" style={{ color: 'var(--dg-text-primary)', fontSize: '0.9rem' }}>
              Select Report Type
            </h6>
            <div className="row g-2 mb-3" style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {REPORT_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <div className="col-12 col-md-6" key={type.id}>
                    <div
                      className={`card p-2.5 h-100 cursor-pointer transition-all border ${isSelected ? 'border-primary shadow-sm' : 'border-light'}`}
                      onClick={() => setSelectedType(type.id)}
                      style={{
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'var(--dg-bg-card, #FFFFFF)',
                        borderColor: isSelected ? '#3B82F6' : 'var(--dg-border, #E2E8F0)'
                      }}
                    >
                      <div className="d-flex align-items-start gap-2.5">
                        <div className={`p-2 rounded ${isSelected ? 'bg-primary text-white' : 'bg-light text-secondary'}`}>
                          <Icon size={14} />
                        </div>
                        <div className="flex-grow-1 min-w-0">
                          <div className="d-flex align-items-center justify-content-between">
                            <span className={`fw-bold small ${isSelected ? 'text-primary' : ''}`} style={{ fontSize: '0.85rem' }}>
                              {type.name}
                            </span>
                            <input
                              type="radio"
                              name="reportType"
                              checked={isSelected}
                              onChange={() => setSelectedType(type.id)}
                              className="form-check-input ms-1"
                              style={{ cursor: 'pointer' }}
                            />
                          </div>
                          <p className="text-muted mb-0" style={{ fontSize: '0.73rem', lineHeight: '1.2' }}>
                            {type.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Date Range Selection */}
            <h6 className="fw-bold mb-2" style={{ color: 'var(--dg-text-primary)', fontSize: '0.9rem' }}>
              Date Range
            </h6>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              {[
                { id: 'today', label: 'Today' },
                { id: 'last7', label: 'Last 7 Days' },
                { id: 'last30', label: 'Last 30 Days' },
                { id: 'custom', label: 'Custom' },
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`btn btn-sm ${dateRangePreset === preset.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setDateRangePreset(preset.id)}
                  style={{ fontSize: '0.8rem', borderRadius: '6px' }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {dateRangePreset === 'custom' && (
              <div className="row g-2 mt-1 p-2 rounded bg-light border">
                <div className="col-6">
                  <label className="form-label text-muted small mb-1">From Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-muted small mb-1">To Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer px-4 py-3 bg-light border-top d-flex justify-content-between">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3"
              onClick={handleGenerate}
              disabled={loading}
              style={{ fontWeight: 600 }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FaFilePdf size={14} />
                  Generate PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineReportModal;
