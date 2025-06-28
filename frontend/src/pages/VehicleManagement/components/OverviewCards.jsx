import React from 'react';
import { Truck, Wrench, Users, Route } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, loading }) => (
  <div className="stat-card">
    <div className="stat-icon">
      <Icon className="h-8 w-8 text-gray-500" />
    </div>
    <div className="stat-info">
      <p className="stat-value">{loading ? '...' : value}</p>
      <h3>{title}</h3>
    </div>
  </div>
);

const OverviewCards = ({ stats, loading }) => {

  const statCards = [
    {
      title: 'Total Vehicles',
      value: stats.total,
      icon: Truck,
    },
    {
      title: 'Active',
      value: stats.active,
      icon: Users,
    },
    {
      title: 'Maintenance',
      value: stats.maintenance,
      icon: Wrench,
    },
    {
      title: 'On Route',
      value: stats.onRoute,
      icon: Route,
    }
  ];

  return (
    <div className="stats-grid">
      {statCards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default OverviewCards; 