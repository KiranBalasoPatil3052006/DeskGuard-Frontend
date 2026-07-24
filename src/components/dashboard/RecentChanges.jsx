import React, { memo } from 'react';
import { FaHdd } from 'react-icons/fa';

const RecentChanges = memo(({ changes, hideCardWrap = false }) => {
  const items = Array.isArray(changes) ? changes : [];

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical': return { bg: 'var(--dg-danger-light)', color: 'var(--dg-danger)' };
      case 'important': return { bg: 'var(--dg-warning-light)', color: 'var(--dg-warning)' };
      default: return { bg: 'var(--dg-info-light)', color: 'var(--dg-info)' };
    }
  };

  const listContent = (
    <div className="d-flex flex-column">
      {items.length > 0 ? (
        items.slice(0, 5).map((c, idx) => {
          const badge = getSeverityBadge(c.severity);
          return (
            <div key={c.id || idx} className="d-flex align-items-center gap-3 py-3"
              style={{ borderBottom: idx < Math.min(items.length, 5) - 1 ? '1px solid var(--dg-border-light)' : 'none' }}>
              <div className="summary-icon-wrapper icon-red" style={{ width: '32px', height: '32px', fontSize: '0.8rem', flexShrink: 0 }}>
                <FaHdd />
              </div>
              <div className="flex-grow-1 min-w-0">
                <div className="text-truncate" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dg-text-primary)' }}>
                  {c.item_label || c.item_identifier || 'Hardware'}
                </div>
                <div className="text-truncate" style={{ fontSize: '0.72rem', color: 'var(--dg-text-muted)' }}>
                  {c.previous_value && c.new_value ? `${c.previous_value} → ${c.new_value}` : (c.description || 'Hardware change detected')}
                </div>
              </div>
              <span style={{ 
                fontSize: '0.65rem', fontWeight: 600, borderRadius: 'var(--dg-radius-full)',
                padding: '3px 8px', background: badge.bg, color: badge.color, whiteSpace: 'nowrap'
              }}>
                {c.severity || 'info'}
              </span>
            </div>
          );
        })
      ) : (
        <div className="text-center py-4" style={{ color: 'var(--dg-text-muted)', fontSize: '0.82rem' }}>
          No hardware changes detected
        </div>
      )}
    </div>
  );

  if (hideCardWrap) return listContent;

  return (
    <div className="card h-100" style={{ padding: '20px' }}>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h6 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dg-text-primary)', margin: 0 }}>
          Hardware Changes
        </h6>
        <span style={{
          fontSize: '0.65rem', fontWeight: 600, borderRadius: 'var(--dg-radius-full)',
          padding: '3px 8px', background: 'var(--dg-danger-light)', color: 'var(--dg-danger)'
        }}>
          {items.length}
        </span>
      </div>
      {listContent}
    </div>
  );
});

export default RecentChanges;
