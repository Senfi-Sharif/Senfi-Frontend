import React from 'react';

type Stat = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
};

export default function StatsPanel({
  stats,
}: {
  stats: Stat[];
}) {
  return (
    <div className="stats-panel-container">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="stats-panel-item"
        >
          <div
            className={`stats-panel-number ${stat.color ? 'stats-panel-number-color' : ''}`}
          >
            {stat.icon} {stat.value}
          </div>
          <div className="stats-panel-label">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
} 