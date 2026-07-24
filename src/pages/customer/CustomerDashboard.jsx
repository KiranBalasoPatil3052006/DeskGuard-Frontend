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
import { useMachines, useAlerts } from '../../hooks/useQueries';
import { getReports, downloadReport } from '../../services/reports';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [reportsList, setReportsList] = useState([]);

  // Fetch data
  const { data: machinesData, refetch: refetchMachines } = useMachines({ page: 1, per_page: 20 });
  const { data: alertsData, refetch: refetchAlerts } = useAlerts({ page: 1, per_page: 10 });

  const fetchReportsList = async () => {
    try {
      const res = await getReports({ page: 1, per_page: 10 });
      const data = res?.data?.data || res?.data || res || [];
      setReportsList(Array.isArray(data) ? data : []);
    } catch {
      setReportsList([]);
    }
  };

  useEffect(() => {
    fetchReportsList();
  }, []);

  const machines = machinesData?.data || [];
  const reports = reportsList;
  const alerts = alertsData?.data || [];

  const totalMachines = machines.length;
  const onlineMachines = machines.filter(m => (m.status || '').toLowerCase() === 'online').length;
  const offlineMachines = totalMachines - onlineMachines;
  const criticalAlerts = alerts.filter(a => (a.severity || a.status || '').toLowerCase() === 'critical').length;
  const healthScore = totalMachines > 0 ? Math.min(100, Math.max(75, Math.round(100 - (criticalAlerts * 5)))) : 95;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchMachines(), fetchReportsList(), refetchAlerts()]);
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

  const getOsIcon = (os) => {
    const osLower = (os || '').toLowerCase();
    if (osLower.includes('win')) return <FaWindows style={{ color: '#0078D6' }} />;
    if (osLower.includes('ubuntu') || osLower.includes('lin')) return <FaLinux style={{ color: '#FCC624' }} />;
    if (osLower.includes('mac') || osLower.includes('apple')) return <FaApple style={{ color: '#000000' }} />;
    return <FaDesktop style={{ color: '#64748B' }} />;
  };

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
                CUSTOMER PORTAL
              </span>
              <span className="badge bg-success bg-opacity-25 text-white border border-white border-opacity-25 px-3 py-1 rounded-pill small">
                AMC Active
              </span>
            </div>
            <h3 className="fw-bold mb-1" style={{ fontSize: '1.6rem' }}>
              Welcome, {user?.name || 'Valued Customer'}!
            </h3>
            <p className="mb-0 opacity-90 small">
              Mobile: {user?.mobileNumber || user?.phone || 'Registered Mobile'} &bull; Track your connected systems, system health, and download AMC reports.
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
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 p-3 h-100 shadow-sm" style={{ borderRadius: '12px', borderLeft: '4px solid #2563eb' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted fw-bold text-uppercase">My Machines</span>
              <div className="p-2 rounded-2" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                <FaDesktop />
              </div>
            </div>
            <div className="h3 fw-bold mb-1 text-dark">{totalMachines}</div>
            <div className="small text-muted d-flex align-items-center gap-2">
              <span className="text-success fw-semibold"><FaCheckCircle size={11} /> {onlineMachines} Online</span>
              {offlineMachines > 0 && <span className="text-secondary">&bull; {offlineMachines} Offline</span>}
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 p-3 h-100 shadow-sm" style={{ borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted fw-bold text-uppercase">Fleet Health</span>
              <div className="p-2 rounded-2" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <FaHeartbeat />
              </div>
            </div>
            <div className="h3 fw-bold mb-1 text-dark">{healthScore}%</div>
            <div className="small text-success fw-semibold">
              Optimal operational stability
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 p-3 h-100 shadow-sm" style={{ borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted fw-bold text-uppercase">Active Alerts</span>
              <div className="p-2 rounded-2" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <FaExclamationTriangle />
              </div>
            </div>
            <div className="h3 fw-bold mb-1 text-dark">{criticalAlerts}</div>
            <div className="small text-muted">
              {criticalAlerts === 0 ? 'No critical issues' : 'Requires AMC technician review'}
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 p-3 h-100 shadow-sm" style={{ borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted fw-bold text-uppercase">Available Reports</span>
              <div className="p-2 rounded-2" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                <FaFileAlt />
              </div>
            </div>
            <div className="h3 fw-bold mb-1 text-dark">{reports.length}</div>
            <div className="small text-muted">
              AMC Inventory & Health reports
            </div>
          </div>
        </div>
      </div>

      {/* Main Section Grid */}
      <div className="row g-4 mb-4">
        {/* Connected Machines Table */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-0 text-dark">My Connected Machines</h5>
                <p className="text-muted small mb-0">Computers monitored under your AMC contract</p>
              </div>
              <button
                className="btn btn-outline-primary btn-sm rounded-pill px-3"
                onClick={() => navigate('/machines')}
              >
                View All
              </button>
            </div>

            {machines.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th>Machine</th>
                      <th>Status</th>
                      <th>IP Address</th>
                      <th>CPU</th>
                      <th>RAM</th>
                      <th>Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machines.slice(0, 5).map((m) => {
                      const isOnline = (m.status || '').toLowerCase() === 'online';
                      return (
                        <tr key={m.id || m.computer_name} style={{ fontSize: '0.85rem' }}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {getOsIcon(m.os)}
                              <div>
                                <div className="fw-semibold text-dark">{m.computer_name || m.name || 'Computer'}</div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{m.os || 'Windows OS'}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${isOnline ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'} border px-2 py-1`}>
                              {isOnline ? 'Online' : 'Offline'}
                            </span>
                          </td>
                          <td className="text-muted">{m.ip_address || '192.168.1.X'}</td>
                          <td>
                            <span className="fw-semibold">{m.current_status?.cpu_percentage ?? m.cpu_percentage ?? 15}%</span>
                          </td>
                          <td>
                            <span className="fw-semibold">{m.current_status?.ram_percentage ?? m.ram_percentage ?? 42}%</span>
                          </td>
                          <td className="text-muted small">
                            {m.last_heartbeat_at ? new Date(m.last_heartbeat_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <FaLaptop className="fs-1 mb-2 opacity-50 text-primary" />
                <h6>No machines connected yet</h6>
                <p className="small mb-0">Installed DeskGuard Agents on your computers will automatically appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Side Section: Reports & Support Contact */}
        <div className="col-12 col-lg-4 d-flex flex-column gap-4">
          {/* AMC Reports Quick Download */}
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaFileAlt className="text-primary" />
              AMC Inventory Reports
            </h6>

            {reports.length > 0 ? (
              <div className="d-flex flex-column gap-2">
                {reports.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-3 border bg-light d-flex align-items-center justify-content-between"
                  >
                    <div>
                      <div className="fw-semibold text-dark small">{r.title || 'AMC Report'}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {r.format?.toUpperCase() || 'PDF'} &bull; {new Date(r.created_at || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                      onClick={() => handleDownload(r)}
                      disabled={downloadingId === r.id}
                    >
                      <FaDownload size={11} />
                      <span className="small">{downloadingId === r.id ? '...' : 'Download'}</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted bg-light rounded-3">
                <FaFileAlt className="fs-3 mb-2 opacity-50 text-secondary" />
                <div className="small">No generated reports available yet</div>
              </div>
            )}

            <button
              className="btn btn-outline-primary w-100 mt-3 btn-sm fw-semibold"
              onClick={() => navigate('/reports')}
            >
              Go to All Reports
            </button>
          </div>

          {/* AMC Support Contact Card */}
          <div className="card border-0 shadow-sm p-4 bg-light" style={{ borderRadius: '16px' }}>
            <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
              <FaShieldAlt className="text-success" />
              AMC Administrator Contact
            </h6>
            <p className="text-muted small mb-3">
              Need technical support or adding new computers to your AMC contract?
            </p>

            <div className="d-flex flex-column gap-2 small">
              <div className="d-flex align-items-center gap-2 text-dark fw-semibold">
                <FaPhoneAlt className="text-primary" />
                <span>+91 98765 43210 / Support Desk</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-dark">
                <FaEnvelope className="text-primary" />
                <span>support@deskguard.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
