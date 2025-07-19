/**
 * Security Headers Script
 * Implements Content Security Policy and other security headers
 */

(function() {
  'use strict';
  
  // Content Security Policy
  const csp = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "https://cdn.jsdelivr.net",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com"
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      "https://cdn.jsdelivr.net",
      "https://fonts.googleapis.com"
    ],
    'img-src': [
      "'self'",
      "data:",
      "https:",
      "https://www.google-analytics.com"
    ],
    'font-src': [
      "'self'",
      "https://fonts.gstatic.com",
      "https://cdn.jsdelivr.net"
    ],
    'connect-src': [
      "'self'",
      "https://api.senfi-sharif.ir",
      "https://127.0.0.1:8000",
      "https://localhost:8000",
      "https://www.google-analytics.com"
    ],
    'frame-src': [
      "'none'"
    ],
    'object-src': [
      "'none'"
    ],
    'base-uri': [
      "'self'"
    ],
    'form-action': [
      "'self'"
    ],
    'frame-ancestors': [
      "'self'"
    ],
    'upgrade-insecure-requests': []
  };

  // Convert CSP object to string
  function buildCSP() {
    return Object.entries(csp)
      .map(([key, values]) => {
        if (values.length === 0) {
          return key;
        }
        return `${key} ${values.join(' ')}`;
      })
      .join('; ');
  }

  // Apply CSP if not already set
  if (typeof window !== 'undefined' && !document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = buildCSP();
    document.head.appendChild(meta);
  }

  // Security monitoring
  const securityEvents = [];
  
  // Monitor for potential XSS attempts
  function monitorXSS() {
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
      const element = originalCreateElement.call(document, tagName);
      
      // Monitor script creation
      if (tagName.toLowerCase() === 'script') {
        securityEvents.push({
          type: 'potential_xss',
          timestamp: new Date().toISOString(),
          details: 'Script element created dynamically'
        });
      }
      
      return element;
    };
  }

  // Monitor for eval usage
  function monitorEval() {
    const originalEval = window.eval;
    window.eval = function(code) {
      securityEvents.push({
        type: 'eval_usage',
        timestamp: new Date().toISOString(),
        details: 'Eval function called',
        code: code.substring(0, 100) // Log first 100 chars
      });
      return originalEval.call(window, code);
    };
  }

  // Monitor for localStorage access
  function monitorLocalStorage() {
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;
    
    localStorage.setItem = function(key, value) {
      // Don't log sensitive keys
      if (!['token', 'email', 'role', 'password'].includes(key)) {
        securityEvents.push({
          type: 'localStorage_set',
          timestamp: new Date().toISOString(),
          key: key,
          valueLength: value ? value.length : 0
        });
      }
      return originalSetItem.call(localStorage, key, value);
    };
    
    localStorage.getItem = function(key) {
      if (!['token', 'email', 'role', 'password'].includes(key)) {
        securityEvents.push({
          type: 'localStorage_get',
          timestamp: new Date().toISOString(),
          key: key
        });
      }
      return originalGetItem.call(localStorage, key);
    };
  }

  // Initialize security monitoring
  if (typeof window !== 'undefined') {
    monitorXSS();
    monitorEval();
    monitorLocalStorage();
    
    // Log security events to console in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      setInterval(() => {
        if (securityEvents.length > 0) {
          console.log('Security Events:', securityEvents);
          securityEvents.length = 0; // Clear events
        }
      }, 30000); // Log every 30 seconds
    }
  }

  // Prevent clickjacking
  if (typeof window !== 'undefined' && window.self !== window.top) {
    window.top.location = window.self.location;
  }

  // Disable right-click context menu (optional)
  if (typeof window !== 'undefined') {
    document.addEventListener('contextmenu', function(e) {
      // Allow right-click on specific elements
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      e.preventDefault();
    });
  }

  // Prevent drag and drop of sensitive elements
  if (typeof window !== 'undefined') {
    document.addEventListener('dragstart', function(e) {
      if (e.target.classList.contains('sensitive') || e.target.closest('.sensitive')) {
        e.preventDefault();
      }
    });
  }

  console.log('Security headers and monitoring initialized');
})(); 