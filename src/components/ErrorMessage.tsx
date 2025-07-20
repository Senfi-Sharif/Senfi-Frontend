import React from 'react';
import { FaExclamationCircle, FaExclamationTriangle } from 'react-icons/fa';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning';
  showIcon?: boolean;
  className?: string;
  onRetry?: () => void;
  retryText?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = 'error',
  showIcon = true,
  className = '',
  onRetry,
  retryText = 'تلاش مجدد'
}) => {
  const icon = type === 'error' ? <FaExclamationCircle /> : <FaExclamationTriangle />;
  const iconColor = type === 'error' ? 'text-red-500' : 'text-yellow-500';

  return (
    <div className={`error-message error-message-${type} ${className}`}>
      {showIcon && (
        <div className={`error-message-icon ${iconColor}`}>
          {icon}
        </div>
      )}
      <div className="error-message-text">{message}</div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="error-message-retry-btn"
        >
          {retryText}
        </button>
      )}
    </div>
  );
};

export default ErrorMessage; 