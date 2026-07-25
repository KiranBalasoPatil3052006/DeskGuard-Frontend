import React, { useState, useEffect } from 'react';
import { getCustomerSupport } from '../services/customerApi';
import {
  FaHeadset,
  FaEnvelope,
  FaPhoneAlt,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneVolume,
  FaPaperPlane
} from 'react-icons/fa';

const CustomerSupport = () => {
  const [support, setSupport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contacted, setContacted] = useState(false);

  useEffect(() => {
    const fetchSupport = async () => {
      setLoading(true);
      try {
        const res = await getCustomerSupport();
        setSupport(res);
      } catch (err) {
        console.error('Failed to load support info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSupport();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Support Info...</span>
        </div>
      </div>
    );
  }

  const s = support || {};

  return (
    <div className="d-flex flex-column gap-4" style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          AMC Help & Support Center
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, marginTop: '4px' }}>
          Get direct technical assistance for your registered AMC computers.
        </p>
      </div>

      {contacted && (
        <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
          <FaPaperPlane />
          <span>Support ticket request sent! Our AMC engineering team will contact you shortly.</span>
        </div>
      )}

      {/* Main Support Cards Grid */}
      <div className="row g-4">
        {/* Support Phone */}
        <div className="col-12 col-md-6">
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              height: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                flexShrink: 0
              }}
            >
              <FaPhoneAlt />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Support Helpline
              </span>
              <h5 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px 0' }}>
                {s.support_phone || '+91 1800-123-4567'}
              </h5>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                Toll-free customer assistance for any hardware or software issue.
              </p>
            </div>
          </div>
        </div>

        {/* Support Email */}
        <div className="col-12 col-md-6">
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              height: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                flexShrink: 0
              }}
            >
              <FaEnvelope />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Support Email
              </span>
              <h5 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px 0' }}>
                {s.support_email || 'support@deskguard.com'}
              </h5>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                Send logs or general inquiries directly to our support desk.
              </p>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="col-12 col-md-6">
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              height: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                flexShrink: 0
              }}
            >
              <FaClock />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Working Hours
              </span>
              <h6 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 6px 0' }}>
                {s.business_hours || 'Monday – Saturday: 9:00 AM – 6:00 PM IST'}
              </h6>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                Standard support operating hours for on-site & remote assistance.
              </p>
            </div>
          </div>
        </div>

        {/* 24/7 Emergency Line */}
        <div className="col-12 col-md-6">
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              height: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                color: '#f43f5e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                flexShrink: 0
              }}
            >
              <FaPhoneVolume />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                24/7 Emergency Line
              </span>
              <h6 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 6px 0' }}>
                {s.emergency_contact || '+91 98765 43210'}
              </h6>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                Dedicated emergency channel for critical server outages.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Address & Direct Action Box */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '16px'
        }}
      >
        <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.9rem' }}>
          <FaMapMarkerAlt className="text-primary" />
          <span>{s.company_address || 'DeskGuard AMC Support Operations Center, Tech Park, India'}</span>
        </div>
        <button
          onClick={() => setContacted(true)}
          className="btn btn-primary btn-lg d-flex align-items-center gap-2"
          style={{ padding: '12px 32px', borderRadius: '10px', fontWeight: 700, fontSize: '1rem' }}
        >
          <FaHeadset />
          <span>Request Support Callback</span>
        </button>
      </div>
    </div>
  );
};

export default CustomerSupport;
