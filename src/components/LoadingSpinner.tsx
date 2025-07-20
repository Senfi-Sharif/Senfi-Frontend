import React from 'react';
import { FaRegListAlt, FaSpinner } from 'react-icons/fa';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showIcon?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'در حال بارگذاری...',
  size = 'medium',
  className = '',
  showIcon = true
}) => {
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const iconSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl'
  };

  return (
    <div className={`loading-spinner ${sizeClasses[size]} ${className}`}>
      {showIcon && (
        <div className={`loading-spinner-icon ${iconSizes[size]}`}>
          <FaSpinner className="animate-spin" />
        </div>
      )}
      <div className="loading-spinner-message">{message}</div>
    </div>
  );
};

export default LoadingSpinner; 