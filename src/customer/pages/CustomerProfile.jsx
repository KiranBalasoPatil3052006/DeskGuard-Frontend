import React, { useState, useEffect } from 'react';
import { FaUser, FaBuilding, FaEnvelope, FaMobileAlt, FaDesktop, FaShieldAlt } from 'react-icons/fa';
import { getCustomerProfile } from '../services/customerApi';

const CustomerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getCustomerProfile();
        const data = res?.data?.data || res?.data || res;
        setProfile(data);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-primary" role="status" /></div>;
  }

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Customer Account Profile</h4>
        <p className="text-muted small mb-0">View your verified AMC customer details and system subscription status.</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
            <h6 className="fw-bold text-dark mb-4 border-bottom pb-2">Profile Information</h6>

            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle"><FaUser /></div>
                <div>
                  <div className="text-muted small">Customer Name</div>
                  <div className="fw-bold text-dark">{profile?.customerName || 'Kiran Patil'}</div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-info bg-opacity-10 text-info rounded-circle"><FaBuilding /></div>
                <div>
                  <div className="text-muted small">Company Name</div>
                  <div className="fw-bold text-dark">{profile?.companyName || 'DeskGuard Customer'}</div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-success bg-opacity-10 text-success rounded-circle"><FaMobileAlt /></div>
                <div>
                  <div className="text-muted small">Registered Mobile</div>
                  <div className="fw-bold text-dark">+91 {profile?.mobileNumber || '6846810210'}</div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-circle"><FaEnvelope /></div>
                <div>
                  <div className="text-muted small">Primary Email</div>
                  <div className="fw-bold text-dark">{profile?.email || 'customer@deskguard.com'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm p-4 bg-light h-100" style={{ borderRadius: '16px' }}>
            <h6 className="fw-bold text-dark mb-3">AMC Plan &amp; Subscription</h6>
            <div className="p-3 bg-white rounded-3 border mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark">Contract Status</span>
                <span className="badge bg-success">Active AMC</span>
              </div>
            </div>
            <div className="p-3 bg-white rounded-3 border">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark">Monitored Systems Count</span>
                <span className="h5 fw-bold text-primary mb-0">{profile?.registeredSystems || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
