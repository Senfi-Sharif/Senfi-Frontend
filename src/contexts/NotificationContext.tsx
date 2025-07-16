import React, { createContext, useContext, useState, ReactNode } from 'react';
import Notification from '@site/src/components/Notification';

interface NotificationItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning', duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationItem = { id, message, type, duration };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, removeNotification }}>
      {children}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{
              marginBottom: index > 0 ? '10px' : '0',
              transform: `translateY(${index * 80}px)`,
              transition: 'transform 0.3s ease',
            }}
          >
            <Notification
              message={notification.message}
              type={notification.type}
              duration={notification.duration}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}; 