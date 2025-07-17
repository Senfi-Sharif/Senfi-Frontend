import React from 'react';
import { statsContainer, statItem, statNumber, statLabel } from '../theme/sharedStyles';

type Stat = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
};

export default function StatsPanel({
  stats,
  background,
  border,
  itemBackground,
  itemBorder,
  numberColor,
  labelColor,
}: {
  stats: Stat[];
  background?: string;
  border?: string;
  itemBackground?: string;
  itemBorder?: string;
  numberColor?: string;
  labelColor?: string;
}) {
  return (
    <div
      style={{
        ...statsContainer,
        background: background || 'var(--ifm-background-color)',
        border: border || statsContainer.border,
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={i}
          style={{
            ...statItem,
            background: itemBackground || 'var(--ifm-background-surface-color, #fff)',
            border: itemBorder || statItem.border,
            color: stat.color || numberColor || 'var(--ifm-color-primary)',
            margin: '0 0.5rem',
          }}
        >
          <div
            style={{
              ...statNumber,
              color: stat.color || numberColor || statNumber.color,
            }}
          >
            {stat.icon} {stat.value}
          </div>
          <div
            style={{
              ...statLabel,
              color: labelColor || statLabel.color,
            }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
} 