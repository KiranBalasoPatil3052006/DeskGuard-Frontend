import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMachineOverview } from '../services/customerApi';
import {
  FaArrowLeft,
  FaDesktop,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaMicrochip,
  FaMemory,
  FaHdd,
  FaWifi,
  FaBatteryThreeQuarters,
  FaShieldAlt,
  FaLock,
  FaSync,
  FaInfoCircle,
  FaCalendarAlt,
  FaExternalLinkAlt
} from 'react-icons/fa';

const CustomerMachineOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        setError(null);
        const res = await getMachineOverview(id);
        setData(res);
      } catch (err) {
        console.error('Failed to load system overview:', err);
        setError('System overview not found or access denied.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOverview();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Machine Details...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-5">
        <FaTimesCircle size={48} className="text-danger mb-3" />
        <h4>System Not Found</h4>
        <p className="text-muted">{error || 'The requested system details could not be retrieved.'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/customer/systems')}>
          ← Back to My Systems
        </button>
      </div>
    );
  }

  const sys = data.system_info || {};
  const perf = data.performance || {};
  const storage = data.storage || [];
  const sec = data.security || {};
  const amcCoverage = data.amc_coverage || { status: 'Active', start_date: null, end_date: null, remaining_days: 90 };
  const statusSec = data.status_section || {};

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Breadcrumb & Back Button */}
      <div className="d-flex align-items-center justify-content-between">
        <button
          onClick={() => navigate('/customer/systems')}
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
          style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 600 }}
        >
          <FaArrowLeft />
          <span>Back to My Systems</span>
        </button>
        <div className="d-flex align-items-center gap-2">
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Status:</span>
          <span
            className={`badge ${
              sys.machine_status?.toLowerCase() === 'healthy' || sys.machine_status?.toLowerCase() === 'online'
                ? 'bg-success'
                : sys.machine_status?.toLowerCase() === 'warning'
                ? 'bg-warning text-dark'
                : 'bg-danger'
            } fw-bold`}
            style={{ fontSize: '0.85rem' }}
          >
            {sys.machine_status}
          </span>
        </div>
      </div>

      {/* SECTION 1: System Information Banner */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px 28px'
        }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem'
              }}
            >
              <FaDesktop />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {sys.computer_name}
              </h2>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                {sys.operating_system} • {sys.windows_version}
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-4 text-md-end">
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                System Uptime
              </span>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{sys.system_uptime}</div>
            </div>
            <div style={{ width: '1px', height: '36px', backgroundColor: '#e2e8f0' }} />
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Health Score
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: sys.health_score >= 80 ? '#10b981' : '#f59e0b' }}>
                {sys.health_score}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Performance Metrics */}
      <div>
        <h5 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }} className="d-flex align-items-center gap-2">
          <FaInfoCircle style={{ color: '#2563eb' }} /> Performance Summary
        </h5>
        <div className="row g-3">
          {/* CPU Card */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  <FaMicrochip className="me-1" /> CPU Usage
                </span>
                <span className={`badge ${perf.cpu_status === 'Critical' ? 'bg-danger' : 'bg-success-subtle text-success'} fw-bold`}>
                  {perf.cpu_status}
                </span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{perf.cpu_usage}%</div>
              <div className="progress mt-2" style={{ height: '6px', backgroundColor: '#e2e8f0' }}>
                <div className="progress-bar bg-primary" style={{ width: `${perf.cpu_usage}%` }} />
              </div>
            </div>
          </div>

          {/* Memory Card */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  <FaMemory className="me-1" /> Memory Usage
                </span>
                <span className={`badge ${perf.memory_status === 'Critical' ? 'bg-danger' : 'bg-success-subtle text-success'} fw-bold`}>
                  {perf.memory_status}
                </span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{perf.memory_usage}%</div>
              <div className="progress mt-2" style={{ height: '6px', backgroundColor: '#e2e8f0' }}>
                <div className="progress-bar bg-info" style={{ width: `${perf.memory_usage}%` }} />
              </div>
            </div>
          </div>

          {/* Disk Card */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  <FaHdd className="me-1" /> Storage Usage
                </span>
                <span className={`badge ${perf.disk_status === 'Warning' ? 'bg-warning text-dark' : 'bg-success-subtle text-success'} fw-bold`}>
                  {perf.disk_status}
                </span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{perf.disk_usage}%</div>
              <div className="progress mt-2" style={{ height: '6px', backgroundColor: '#e2e8f0' }}>
                <div className="progress-bar bg-warning" style={{ width: `${perf.disk_usage}%` }} />
              </div>
            </div>
          </div>

          {/* Network & Battery Card */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  <FaWifi className="me-1" /> Network
                </span>
                <span className={`badge ${perf.network_status === 'Connected' ? 'bg-success' : 'bg-secondary'} fw-bold`}>
                  {perf.network_status}
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginTop: '12px' }}>
                <FaBatteryThreeQuarters className="me-1 text-primary" /> {perf.battery_status}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Power Status</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Storage Breakdown */}
      <div>
        <h5 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }} className="d-flex align-items-center gap-2">
          <FaHdd style={{ color: '#2563eb' }} /> Storage Drives
        </h5>
        <div className="row g-3">
          {storage.map((drive, idx) => (
            <div key={idx} className="col-12 col-md-6">
              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div>
                    <h6 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {drive.drive_name} ({drive.volume_label})
                    </h6>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {drive.used_gb} GB Used of {drive.total_gb} GB ({drive.free_gb} GB Free)
                    </span>
                  </div>
                  <span className={`badge ${drive.status === 'Warning' ? 'bg-warning text-dark' : 'bg-success-subtle text-success'} fw-bold`}>
                    {drive.status}
                  </span>
                </div>
                <div className="progress mt-3" style={{ height: '8px', backgroundColor: '#e2e8f0' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${drive.used_percentage}%`,
                      backgroundColor: drive.used_percentage > 90 ? '#f43f5e' : drive.used_percentage > 75 ? '#f59e0b' : '#2563eb'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: Essential Security Info */}
      <div>
        <h5 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }} className="d-flex align-items-center gap-2">
          <FaShieldAlt style={{ color: '#2563eb' }} /> Security Status
        </h5>
        <div className="row g-3">
          {[
            { title: 'Antivirus Protection', value: sec.antivirus, icon: <FaShieldAlt />, color: '#10b981' },
            { title: 'Windows Firewall', value: sec.firewall, icon: <FaShieldAlt />, color: '#10b981' },
            { title: 'Windows Update', value: sec.windows_update, icon: <FaSync />, color: sec.windows_update?.includes('Pending') ? '#f59e0b' : '#10b981' },
            { title: 'BitLocker Encryption', value: sec.bitlocker, icon: <FaLock />, color: '#10b981' }
          ].map((item, idx) => (
            <div key={idx} className="col-12 col-sm-6 col-xl-3">
              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: `${item.color}15`,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem'
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    {item.title}
                  </span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{item.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: AMC Coverage */}
      <div>
        <h5 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }} className="d-flex align-items-center gap-2">
          <FaCalendarAlt style={{ color: '#2563eb' }} /> AMC Coverage
        </h5>
        <div
          style={{
            backgroundColor: amcCoverage.status === 'Active' ? '#f0fdf4' : '#fef2f2',
            borderRadius: '14px',
            border: `1px solid ${amcCoverage.status === 'Active' ? '#bbf7d0' : '#fecaca'}`,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: amcCoverage.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                color: amcCoverage.status === 'Active' ? '#16a34a' : '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}
            >
              <FaShieldAlt />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>AMC Status</span>
                <span
                  className="badge fw-bold"
                  style={{
                    fontSize: '0.72rem',
                    backgroundColor: amcCoverage.status === 'Active' ? '#16a34a' : '#dc2626',
                    color: '#ffffff',
                    padding: '3px 12px',
                    borderRadius: '20px'
                  }}
                >
                  {amcCoverage.status}
                </span>
              </div>
              <div className="d-flex flex-wrap align-items-center gap-3" style={{ fontSize: '0.85rem', color: '#475569' }}>
                <span>Start: {amcCoverage.start_date ? new Date(amcCoverage.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</span>
                <span>|</span>
                <span>Expires: {amcCoverage.end_date ? new Date(amcCoverage.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</span>
                <span>|</span>
                <span style={{ fontWeight: 700, color: amcCoverage.remaining_days > 30 ? '#16a34a' : amcCoverage.remaining_days > 0 ? '#ca8a04' : '#dc2626' }}>
                  {amcCoverage.remaining_days > 0 ? `${amcCoverage.remaining_days} days remaining` : 'Expired'}
                </span>
              </div>
            </div>
          </div>
          {showComingSoon && (
            <div className="alert alert-info d-flex align-items-center gap-2 w-100 mb-0" role="alert" style={{ fontSize: '0.88rem' }}>
              <FaInfoCircle />
              <span>AMC renewal portal is coming soon. Please contact support for renewal assistance.</span>
              <button type="button" className="btn-close ms-auto" onClick={() => setShowComingSoon(false)} aria-label="Close" />
            </div>
          )}
          {!showComingSoon && (
            <button
              className={`btn btn-sm d-flex align-items-center gap-2 ${amcCoverage.status === 'Expired' ? 'btn-outline-danger' : 'btn-outline-primary'}`}
              onClick={() => setShowComingSoon(true)}
              style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}
            >
              <FaExternalLinkAlt size={11} />
              <span>Renew AMC</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 6: Status & Synchronization */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '18px 24px',
          fontSize: '0.82rem',
          color: '#64748b'
        }}
        className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2"
      >
        <span>
          Current Machine Status: <strong style={{ color: '#0f172a' }}>{statusSec.current_status}</strong>
        </span>
        <span>
          Last Agent Synchronization: <strong style={{ color: '#0f172a' }}>{new Date(statusSec.last_sync_time || Date.now()).toLocaleString()}</strong>
        </span>
      </div>
    </div>
  );
};

export default CustomerMachineOverview;
