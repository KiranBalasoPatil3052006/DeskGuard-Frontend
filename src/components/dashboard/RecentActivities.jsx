import { memo } from 'react';
import { FaPlug, FaPowerOff, FaFileAlt, FaLaptopMedical, FaSignInAlt } from 'react-icons/fa';

const iconColorMap = {
  success: { bg: 'var(--dg-success-light)', color: 'var(--dg-success)' },
  primary: { bg: 'var(--dg-primary-light)', color: 'var(--dg-primary)' },
  danger: { bg: 'var(--dg-danger-light)', color: 'var(--dg-danger)' },
  info: { bg: 'var(--dg-info-light)', color: 'var(--dg-info)' },
  secondary: { bg: 'var(--dg-gray-100)', color: 'var(--dg-gray-500)' },
  warning: { bg: 'var(--dg-warning-light)', color: 'var(--dg-warning)' },
};

const RecentActivities = memo(({ activities: propActivities, loading, hideCardWrap = false }) => {
  const activities = Array.isArray(propActivities) ? propActivities : [];

  const listContent = (
    <div>
      {activities.length > 0 ? (
        activities.map((activity, index) => {
          const iconStyle = iconColorMap[activity.color] || iconColorMap.secondary;
          return (
            <div key={index} className="d-flex align-items-center py-3"
              style={{ borderBottom: index < activities.length - 1 ? '1px solid var(--dg-border-light)' : 'none' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: 'var(--dg-radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: iconStyle.bg, color: iconStyle.color,
                fontSize: '0.85rem', flexShrink: 0, marginRight: '12px'
              }}>
                {activity.icon}
              </div>
              <div className="flex-grow-1 min-w-0">
                <div className="text-truncate" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dg-text-primary)' }}>
                  {activity.type}
                </div>
                <div className="text-truncate" style={{ fontSize: '0.72rem', color: 'var(--dg-text-muted)' }}>
                  {activity.detail}
                </div>
              </div>
              <div className="ms-2 flex-shrink-0" style={{ fontSize: '0.68rem', color: 'var(--dg-gray-400)' }}>
                {activity.time}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-4 text-muted" style={{ fontSize: '0.82rem' }}>
          No recent activities recorded
        </div>
      )}
    </div>
  );

  if (hideCardWrap) return listContent;

  return (
    <div className="card h-100" style={{ padding: '20px' }}>
      <h6 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dg-text-primary)', marginBottom: '4px' }}>
        Recent Activities
      </h6>
      {listContent}
    </div>
  );
});

export default RecentActivities;
