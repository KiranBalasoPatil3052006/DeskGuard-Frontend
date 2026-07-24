import React, { memo } from 'react';
import {
  FaDesktop,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaHeartbeat,
  FaMicrochip,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const SummaryCards = memo(({ data }) => {
  const total = data?.cards?.total_machines ?? 0;
  const online = data?.cards?.online_count ?? 0;
  const offline = data?.cards?.offline_count ?? 0;
  const critical = data?.cards?.critical_alerts ?? 0;
  const changes = data?.cards?.hardware_changes_count ?? 7;

  const onlinePercent = total > 0 ? Math.round((online / total) * 100) : 0;
  const healthScore = data?.health_score ?? (total > 0 ? Math.min(100, Math.max(70, Math.round(100 - (critical * 5)))) : 85);

  const cards = [
    {
      id: 'total',
      title: 'TOTAL MACHINES',
      value: total,
      trend: '12 from yesterday',
      trendUp: true,
      icon: <FaDesktop />,
      accentColor: '#2563eb',
      lightBg: 'rgba(37, 99, 235, 0.08)',
      badgeBg: 'rgba(37, 99, 235, 0.1)',
      badgeText: '#1d4ed8'
    },
    {
      id: 'online',
      title: 'ONLINE MACHINES',
      value: online,
      trend: '8 from yesterday',
      trendUp: true,
      icon: <FaCheckCircle />,
      accentColor: '#10b981',
      lightBg: 'rgba(16, 185, 129, 0.08)',
      badgeBg: 'rgba(16, 185, 129, 0.1)',
      badgeText: '#047857',
      subtitle: `${onlinePercent}% active`
    },
    {
      id: 'offline',
      title: 'OFFLINE MACHINES',
      value: offline,
      trend: '2 from yesterday',
      trendUp: false,
      icon: <FaTimesCircle />,
      accentColor: '#f43f5e',
      lightBg: 'rgba(244, 63, 94, 0.08)',
      badgeBg: 'rgba(244, 63, 94, 0.1)',
      badgeText: '#be123c'
    },
    {
      id: 'critical',
      title: 'CRITICAL ALERTS',
      value: critical,
      trend: '1 from yesterday',
      trendUp: true,
      icon: <FaExclamationTriangle />,
      accentColor: '#f59e0b',
      lightBg: 'rgba(245, 158, 11, 0.08)',
      badgeBg: 'rgba(245, 158, 11, 0.1)',
      badgeText: '#b45309'
    },
    {
      id: 'health',
      title: 'AVG. HEALTH SCORE',
      isRadial: true,
      percentage: healthScore,
      trend: '6% from yesterday',
      trendUp: true,
      icon: <FaHeartbeat />,
      accentColor: '#8b5cf6',
      lightBg: 'rgba(139, 92, 246, 0.08)',
      badgeBg: 'rgba(139, 92, 246, 0.1)',
      badgeText: '#6d28d9'
    },
    {
      id: 'changes',
      title: 'HARDWARE CHANGES',
      value: changes,
      trend: '3 from yesterday',
      trendUp: true,
      icon: <FaMicrochip />,
      accentColor: '#06b6d4',
      lightBg: 'rgba(6, 182, 212, 0.08)',
      badgeBg: 'rgba(6, 182, 212, 0.1)',
      badgeText: '#0369a1'
    }
  ];

  return (
    <>
      <style>{`
        .summary-cards-6-container {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          width: 100%;
        }

        @media (max-width: 1500px) {
          .summary-cards-6-container {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 992px) {
          .summary-cards-6-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .summary-cards-6-container {
            grid-template-columns: 1fr;
          }
        }

        .premium-kpi-card {
          position: relative;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 124px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
        }

        .kpi-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .kpi-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          flex-shrink: 0;
        }

        .kpi-title {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .kpi-body {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 8px;
          margin-top: auto;
        }

        .kpi-value-text {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1.1;
          color: #0f172a;
          font-feature-settings: "tnum";
          font-variant-numeric: tabular-nums;
        }

        .kpi-radial-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .radial-progress-svg {
          width: 44px;
          height: 44px;
          transform: rotate(-90deg);
        }

        .radial-bg {
          fill: none;
          stroke: #e2e8f0;
          stroke-width: 3.5;
        }

        .radial-fill {
          fill: none;
          stroke: #10b981;
          stroke-width: 3.5;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.8s ease;
        }

        .radial-text {
          font-size: 0.75rem;
          font-weight: 800;
          fill: #0f172a;
          text-anchor: middle;
          dominant-baseline: central;
        }

        .kpi-trend-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 20px;
          white-space: nowrap;
        }
      `}</style>

      <div className="summary-cards-6-container">
        {cards.map((card) => (
          <div
            key={card.id}
            className="premium-kpi-card"
            style={{ '--card-accent': card.accentColor }}
          >
            {/* Card Header */}
            <div className="kpi-header">
              <div
                className="kpi-icon-box"
                style={{ backgroundColor: card.lightBg, color: card.accentColor }}
              >
                {card.icon}
              </div>
              <span className="kpi-title">{card.title}</span>
            </div>

            {/* Card Body */}
            <div className="kpi-body">
              {card.isRadial ? (
                <div className="kpi-radial-container">
                  <svg className="radial-progress-svg" viewBox="0 0 36 36">
                    <path
                      className="radial-bg"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="radial-fill"
                      strokeDasharray={`${card.percentage}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <text x="18" y="18" className="radial-text" transform="rotate(90 18 18)">
                      {card.percentage}%
                    </text>
                  </svg>
                </div>
              ) : (
                <div className="kpi-value-text">{card.value}</div>
              )}

              {/* Trend Badge */}
              <div
                className="kpi-trend-pill"
                style={{ backgroundColor: card.badgeBg, color: card.badgeText }}
              >
                {card.trendUp ? <FaArrowUp style={{ fontSize: '0.65rem' }} /> : <FaArrowDown style={{ fontSize: '0.65rem' }} />}
                <span>{card.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
});

export default SummaryCards;
