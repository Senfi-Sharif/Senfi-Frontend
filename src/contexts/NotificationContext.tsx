import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import Notification from '../components/Notification';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
  duration: number;
}

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType, duration?: number) => void;
  closeNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<NotificationItem | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // نمایش نوتیفیکیشن جدید (همیشه فقط یکی)
  const showNotification = (message: string, type: NotificationType, duration = 4000) => {
    // اگر پیام فعلی دقیقاً همین است، دوباره نمایش نده
    if (notification && notification.message === message && notification.type === type) return;
    setNotification({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      message,
      type,
      duration,
    });
  };

  // بستن نوتیفیکیشن
  const closeNotification = () => {
    setNotification(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // مدیریت auto-close
  useEffect(() => {
    if (notification) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setNotification(null);
      }, notification.duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [notification]);

  // جلوگیری از نمایش مجدد پیام قبلی بعد از remount
  useEffect(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, closeNotification }}>
      {children}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
        {notification && (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={closeNotification}
          />
        )}
      </div>
    </NotificationContext.Provider>
  );
}; 