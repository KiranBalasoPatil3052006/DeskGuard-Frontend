import React, { useState, useEffect } from 'react';
import { getCustomerProfile } from '../services/customerApi';
import {
  FaUser,
  FaBuilding,
  FaPhoneAlt,
  FaEnvelope,
  FaDesktop,
  FaCalendarAlt,
  FaShieldAlt
} from 'react-icons/fa';

const CustomerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await getCustomerProfile();
        setProfile(res);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Profile...</span>
        </div>
      </div>
    );
  }

  const p = profile || {};

  return (
    <div className="d-flex flex-column gap-4" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Title */}
      <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Customer Account Profile
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, marginTop: '4px' }}>
          Your registered AMC account details and contract scope.
        </p>
      </div>

      {/* Main Profile Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div className="d-flex align-items-center gap-3 mb-4 border-bottom pb-3">
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem'
            }}
          >
            <FaUser />
          </div>
          <div>
            <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {p.customer_name || 'AMC Customer'}
            </h4>
            <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>
              {p.company_name || 'Registered AMC Account'}
            </span>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <FaBuilding className="text-primary fs-4" />
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Company Name
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  {p.company_name || 'DeskGuard Customer'}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <FaPhoneAlt className="text-primary fs-4" />
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Registered Mobile Number
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  {p.mobile_number || '9876543210'}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <FaEnvelope className="text-primary fs-4" />
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Email Address
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  {p.email || 'customer@company.com'}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <FaDesktop className="text-primary fs-4" />
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Registered Systems Count
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  {p.registered_systems_count ?? 5} Systems
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <FaCalendarAlt className="text-primary fs-4" />
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  AMC Registration Date
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  {new Date(p.amc_registration_date || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <FaShieldAlt className="text-success fs-4" />
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Account Status
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>
                  Active AMC Contract
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
