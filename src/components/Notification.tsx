import React, { useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaExclamationCircle } from 'react-icons/fa';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, duration, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // انیمیشن بسته شدن
  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  let icon = null;
  if (type === 'success') icon = <FaCheckCircle className="notification-icon" style={{ color: '#48cf7c' }} />;
  else if (type === 'error') icon = <FaExclamationTriangle className="notification-icon" style={{ color: '#ff5252' }} />;
  else if (type === 'warning') icon = <FaExclamationCircle className="notification-icon" style={{ color: '#e09766' }} />;
  else if (type === 'info') icon = <FaInfoCircle className="notification-icon" style={{ color: '#60a5fa' }} />;

  return (
    <div className={`notification notification-${type}${isAnimating ? ' notification-animating' : ''}`}>
      {icon}
      <div className="notification-message">{message}</div>
      <button className="notification-close-button" onClick={handleClose}>×</button>
    </div>
  );
};

export default Notification; 