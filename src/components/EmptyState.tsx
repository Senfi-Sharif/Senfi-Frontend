import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  className?: string;
  showIcon?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📋',
  title,
  subtitle,
  className = '',
  showIcon = true
}) => {
  return (
    <div className={`empty-state ${className}`}>
      {showIcon && (
        <div className="empty-state-icon">
          {icon}
        </div>
      )}
      <div className="empty-state-title">{title}</div>
      {subtitle && (
        <div className="empty-state-subtitle">{subtitle}</div>
      )}
    </div>
  );
};

export default EmptyState; 