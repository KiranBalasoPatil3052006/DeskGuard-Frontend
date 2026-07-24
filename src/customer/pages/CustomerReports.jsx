import React, { useState, useEffect } from 'react';
import {
  FaFileAlt,
  FaDownload,
  FaDesktop,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';
import { getCustomerSystems } from '../services/customerApi';
import { downloadAmcHealthSummaryReport, downloadAssetInventoryReport } from '../../services/reports';

const CustomerReports = () => {
  const [systems, setSystems] = useState([]);
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [reportType, setReportType] = useState('health');
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchSystems = async () => {
      try {
        const res = await getCustomerSystems({ page: 1, per_page: 50 });
        const data = res?.data?.data || res?.data || res || [];
        setSystems(Array.isArray(data) ? data : []);
      } catch {
        setSystems([]);
      }
    };
    fetchSystems();
  }, []);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      let res;
      if (reportType === 'inventory') {
        res = await downloadAssetInventoryReport({ machineId: selectedMachineId });
      } else {
        res = await downloadAmcHealthSummaryReport({ machineId: selectedMachineId });
      }

      const blobData = res?.data ?? res;
      const blob = blobData instanceof Blob ? blobData : new Blob([blobData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer-${reportType}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMsg('Report generated and downloaded successfully!');
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">My AMC Reports</h4>
        <p className="text-muted small mb-0">Generate and download official health, inventory, and audit reports for your registered systems.</p>
      </div>

      <div className="row g-4">
        {/* Report Generator Card */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaFileAlt className="text-primary" /> Generate System Report
            </h5>

            {successMsg && <div className="alert alert-success py-2 small mb-3">{successMsg}</div>}
            {errorMsg && <div className="alert alert-danger py-2 small mb-3">{errorMsg}</div>}

            <form onSubmit={handleGenerateReport} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label fw-semibold small text-muted">Select Target System</label>
                <select
                  className="form-select bg-light"
                  value={selectedMachineId}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                >
                  <option value="">All Registered Systems (Summary)</option>
                  {systems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.computerName} ({s.operatingSystem || 'Windows'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label fw-semibold small text-muted">Select Report Type</label>
                <select
                  className="form-select bg-light"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="health">Machine Health & Operational Summary Report (PDF)</option>
                  <option value="inventory">Hardware & Software Asset Inventory Report (PDF)</option>
                  <option value="alerts">System Alert & Security Incident Audit Log (PDF)</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 mt-2"
                disabled={generating}
                style={{ borderRadius: '8px' }}
              >
                {generating ? (
                  <><FaSpinner className="spin-icon" /> Generating PDF...</>
                ) : (
                  <><FaDownload /> Generate &amp; Download PDF</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Report Types Info */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm p-4 bg-light h-100" style={{ borderRadius: '16px' }}>
            <h6 className="fw-bold text-dark mb-3">Available Customer Report Types</h6>
            
            <div className="d-flex flex-column gap-3">
              <div className="p-3 bg-white rounded-3 border">
                <div className="fw-semibold text-primary mb-1 d-flex align-items-center gap-2">
                  <FaCheckCircle /> Machine Health Summary Report
                </div>
                <div className="small text-muted">
                  Includes CPU/RAM/Disk utilization metrics, uptime statistics, system health score, and active alerts.
                </div>
              </div>

              <div className="p-3 bg-white rounded-3 border">
                <div className="fw-semibold text-success mb-1 d-flex align-items-center gap-2">
                  <FaCheckCircle /> Hardware &amp; Software Inventory Report
                </div>
                <div className="small text-muted">
                  Detailed breakdown of computer models, processor details, total RAM, disk capacities, and installed software.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReports;
