import React from 'react';
import { NotificationProvider } from '@site/src/contexts/NotificationContext';

export default function Root({ children }) {
  return <NotificationProvider>{children}</NotificationProvider>;
} 