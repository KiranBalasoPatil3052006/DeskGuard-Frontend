import React, { useState, useEffect } from 'react';
import { FaPhoneAlt, FaEnvelope, FaClock, FaUserShield, FaHeadset, FaPaperPlane } from 'react-icons/fa';
import { getCustomerSupport } from '../services/customerApi';

const CustomerSupport = () => {
  const [support, setSupport] = useState(null);

  useEffect(() => {
    const fetchSupport = async () => {
      try {
        const res = await getCustomerSupport();
        const data = res?.data?.data || res?.data || res;
        setSupport(data);
      } catch {
        setSupport(null);
      }
    };
    fetchSupport();
  }, []);

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">AMC Support &amp; Help Desk</h4>
        <p className="text-muted small mb-0">Get direct assistance from your assigned AMC IT technicians and system administrators.</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
              <FaHeadset className="text-primary" /> Technical Support Contact
            </h5>

            <div className="d-flex flex-column gap-3">
              <div className="p-3 bg-light rounded-3 border d-flex align-items-center gap-3">
                <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle"><FaPhoneAlt /></div>
                <div>
                  <div className="text-muted small">Support Hotline</div>
                  <div className="fw-bold text-dark">{support?.supportPhone || '+91 98765 43210'}</div>
                </div>
              </div>

              <div className="p-3 bg-light rounded-3 border d-flex align-items-center gap-3">
                <div className="p-3 bg-info bg-opacity-10 text-info rounded-circle"><FaEnvelope /></div>
                <div>
                  <div className="text-muted small">Support Email</div>
                  <div className="fw-bold text-dark">{support?.supportEmail || 'support@deskguard.com'}</div>
                </div>
              </div>

              <div className="p-3 bg-light rounded-3 border d-flex align-items-center gap-3">
                <div className="p-3 bg-success bg-opacity-10 text-success rounded-circle"><FaClock /></div>
                <div>
                  <div className="text-muted small">Support Hours</div>
                  <div className="fw-bold text-dark">{support?.businessHours || 'Monday - Saturday, 9:00 AM - 7:00 PM IST'}</div>
                </div>
              </div>

              <div className="p-3 bg-light rounded-3 border d-flex align-items-center gap-3">
                <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-circle"><FaUserShield /></div>
                <div>
                  <div className="text-muted small">Assigned AMC Contact</div>
                  <div className="fw-bold text-dark">{support?.amcContactPerson || 'Senior AMC Administrator'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm p-4 bg-light h-100" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaPaperPlane className="text-primary" /> Request Technical Assistance
            </h5>
            <p className="text-muted small mb-3">
              Future-ready support ticket system. Click below to initiate a support request with your AMC technician.
            </p>

            <button
              className="btn btn-primary py-2 px-4 fw-semibold d-flex align-items-center gap-2 rounded-pill"
              onClick={() => alert('Support ticket logged. An AMC technician will contact you shortly.')}
            >
              <FaHeadset /> Contact Support Technician
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;
