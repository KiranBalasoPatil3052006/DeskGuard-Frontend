import React, { useState } from 'react';
import { useDashboard, useMachines, useAlerts, useDashboardRecentChanges } from '../../hooks/useQueries';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { FaPlus, FaFileExport, FaSync } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

import SummaryCards from '../../components/dashboard/SummaryCards';
import MachineTable from '../../components/dashboard/MachineTable';
import RecentAlerts from '../../components/dashboard/RecentAlerts';
import RecentChanges from '../../components/dashboard/RecentChanges';
import RecentActivities from '../../components/dashboard/RecentActivities';

const SectionSkeleton = ({ height = '200px', className = '' }) => (
  <div
    className={`skeleton ${className}`}
    style={{ height, borderRadius: 'var(--dg-radius-lg)' }}
  />
);

const CardRowSkeleton = () => (
  <div className="summary-cards-5-grid">
    {[1, 2, 3, 4, 5].map(i => (
      <SectionSkeleton height="100px" key={i} />
    ))}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Kiran';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const { data: dashboardData, isLoading: dashLoading, error: dashError } = useDashboard();
  const { data: machinesData, isLoading: machLoading } = useMachines({ per_page: 10 });
  const { data: alertsData, isLoading: alertLoading } = useAlerts({ per_page: 5 });
  const { data: changes, isLoading: changesLoading } = useDashboardRecentChanges(5);

  const machines = machinesData?.data || [];
  const alerts = alertsData?.data || [];

  const handleRefresh = () => {
    setIsRefreshing(true);
    queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (dashError) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
          <h5 style={{ fontWeight: 700, marginBottom: '8px' }}>Something went wrong</h5>
          <p style={{ color: 'var(--dg-text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
            {dashError.message || 'Failed to load dashboard data'}
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2px', letterSpacing: '-0.02em' }}>
            {getGreeting()}, {firstName} 👋
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--dg-text-muted)', margin: 0 }}>
            Here's what's happening with your infrastructure today.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button 
            className="btn btn-primary btn-sm d-flex align-items-center gap-2"
            onClick={() => navigate('/machines')}
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          >
            <FaPlus size={11} />
            <span>Add Machine</span>
          </button>
          <button 
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
            onClick={() => navigate('/reports')}
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          >
            <FaFileExport size={11} />
            <span>Generate Report</span>
          </button>
          <button 
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
            onClick={handleRefresh}
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          >
            <FaSync size={11} className={isRefreshing ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-4">
        {dashLoading ? <CardRowSkeleton /> : <SummaryCards data={dashboardData} />}
      </div>

      {/* Recent Alerts */}
      <div className="mb-4">
        {alertLoading ? <SectionSkeleton height="180px" /> : <RecentAlerts alerts={alerts} />}
      </div>

      {/* Machine Table */}
      <div className="mb-4">
        {machLoading ? (
          <SectionSkeleton height="360px" />
        ) : machines.length > 0 ? (
          <MachineTable machines={machines} />
        ) : (
          <div className="card d-flex align-items-center justify-content-center" style={{ padding: '48px 24px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🖥️</div>
            <h6 style={{ fontWeight: 700, marginBottom: '6px' }}>No Machines Found</h6>
            <p style={{ color: 'var(--dg-text-muted)', fontSize: '0.82rem', margin: 0, textAlign: 'center', maxWidth: '360px' }}>
              No machines are registered yet. Install the DeskGuard Agent on employee computers to start monitoring.
            </p>
          </div>
        )}
      </div>

      {/* Recent Changes + Activity */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-6">
          {changesLoading ? <SectionSkeleton height="320px" /> : <RecentChanges changes={changes} />}
        </div>
        <div className="col-12 col-xl-6">
          <RecentActivities />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
