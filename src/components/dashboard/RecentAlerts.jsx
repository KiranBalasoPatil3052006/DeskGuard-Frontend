import React, { memo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const RecentAlerts = memo(({ alerts }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const items = Array.isArray(alerts) ? alerts : [];

  const displayAlerts = items.map((a, idx) => ({
    id: a.id || idx,
    title: a.title || a.alert_type || 'System Event',
    machine_name: a.machine?.device_name || a.machine?.hostname || a.machine_name || 'System',
    description: a.description || 'System warning reported',
    severity: a.severity || 'Warning',
    status: a.status || 'open',
    occurrence_count: a.occurrenceCount || a.occurrence_count || 1,
    max_value: a.maxRecordedValue || a.max_recorded_value,
    time: a.created_at ? new Date(a.created_at).toLocaleTimeString() : '—'
  }));

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const getSeverityStyle = (severity) => {
    const sev = String(severity).toLowerCase();
    switch (sev) {
      case 'critical': return { bg: 'var(--dg-danger-light)', color: 'var(--dg-danger)', dot: 'var(--dg-danger)' };
      case 'warning': return { bg: 'var(--dg-warning-light)', color: 'var(--dg-warning)', dot: 'var(--dg-warning)' };
      default: return { bg: 'var(--dg-info-light)', color: 'var(--dg-info)', dot: 'var(--dg-info)' };
    }
  };

  return (
    <div className="card" style={{ padding: '20px' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <div className="summary-icon-wrapper icon-red" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
            <FaBell />
          </div>
          <h5 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, color: 'var(--dg-text-primary)' }}>
            Recent Alerts
          </h5>
        </div>
        <button 
          onClick={() => navigate('/alerts')} 
          className="btn btn-sm"
          style={{ 
            fontSize: '0.78rem', fontWeight: 600, color: 'var(--dg-primary)',
            background: 'none', border: 'none', padding: '4px 8px'
          }}
        >
          View All →
        </button>
      </div>

      {/* Scrollable alert cards */}
      {displayAlerts.length > 0 ? (
        <div className="position-relative d-flex align-items-center">
          <button 
            className="btn btn-sm"
            style={{ 
              position: 'absolute', left: '-12px', zIndex: 10, width: '28px', height: '28px',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--dg-white)', border: '1px solid var(--dg-border)',
              boxShadow: 'var(--dg-shadow-sm)', color: 'var(--dg-text-muted)', padding: 0
            }}
            onClick={() => handleScroll('left')}
          >
            <FaChevronLeft style={{ fontSize: '0.6rem' }} />
          </button>

          <div 
            ref={scrollRef}
            className="d-flex gap-3 w-100 overflow-auto py-1 px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayAlerts.map((alert) => {
              const style = getSeverityStyle(alert.severity);
              return (
                <div 
                  key={alert.id} 
                  className="flex-shrink-0"
                  style={{ 
                    width: '32%', minWidth: '260px',
                    background: 'var(--dg-white)',
                    border: '1px solid var(--dg-border)',
                    borderLeft: `3px solid ${style.dot}`,
                    borderRadius: 'var(--dg-radius-lg)',
                    padding: '16px',
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: style.dot, flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--dg-text-primary)' }}>{alert.title}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--dg-text-muted)', whiteSpace: 'nowrap', marginLeft: '8px' }}>{alert.time}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--dg-text-secondary)', marginBottom: '4px' }}>
                      {alert.machine_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--dg-text-muted)', lineHeight: 1.4 }}>
                      {alert.description}
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 600, borderRadius: '4px',
                      padding: '2px 6px', background: 'rgba(0,0,0,0.05)', color: 'var(--dg-text-secondary)'
                    }}>
                      {alert.occurrence_count} {alert.occurrence_count === 1 ? 'hit' : 'hits'}
                    </span>
                    <span style={{ 
                      fontSize: '0.68rem', fontWeight: 600, borderRadius: 'var(--dg-radius-full)',
                      padding: '3px 10px', background: style.bg, color: style.color
                    }}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            className="btn btn-sm"
            style={{ 
              position: 'absolute', right: '-12px', zIndex: 10, width: '28px', height: '28px',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--dg-white)', border: '1px solid var(--dg-border)',
              boxShadow: 'var(--dg-shadow-sm)', color: 'var(--dg-text-muted)', padding: 0
            }}
            onClick={() => handleScroll('right')}
          >
            <FaChevronRight style={{ fontSize: '0.6rem' }} />
          </button>
        </div>
      ) : (
        <div className="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>
          No recent alerts reported.
        </div>
      )}

      <style>{`
        .d-flex::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
});

export default RecentAlerts;
