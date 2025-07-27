import React, { useEffect } from 'react';
import { NotificationProvider } from '@site/src/contexts/NotificationContext';
import { URLParameterValidator } from '@site/src/utils/security';

export default function Root({ children }) {
  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    // Set theme immediately to prevent flash
    document.documentElement.setAttribute('data-theme', initialTheme);
    
    // Validate and clean URL parameters to prevent security vulnerabilities
    URLParameterValidator.validateAndCleanURL();
  }, []);

  return <NotificationProvider>{children}</NotificationProvider>;
} 