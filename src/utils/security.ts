/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  if (typeof window !== 'undefined') {
    // Use DOMPurify if available
    try {
      const DOMPurify = require('dompurify');
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'div', 'span'
        ],
        ALLOWED_ATTR: [
          'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
      });
    } catch (error) {
      // Fallback to basic sanitization
      return basicSanitizeHTML(html);
    }
  }
  return basicSanitizeHTML(html);
}

/**
 * Basic HTML sanitization (fallback)
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
function basicSanitizeHTML(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/data:application\/javascript/gi, '')
    .trim();
}

/**
 * Sanitize user input to prevent injection attacks
 * @param input - User input string
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized input string
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:text\/html/gi, '') // Remove data URLs
    .replace(/data:application\/javascript/gi, '') // Remove JavaScript data URLs
    .trim()
    .slice(0, maxLength); // Limit length
}

/**
 * Validate and sanitize URLs
 * @param url - URL string to validate
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Basic URL validation
  const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  if (!urlPattern.test(url)) {
    return '';
  }

  // Ensure protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  // Remove potentially dangerous protocols
  if (url.startsWith('javascript:') || url.startsWith('vbscript:') || url.startsWith('data:')) {
    return '';
  }

  return url;
}

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns True if valid email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.trim().toLowerCase());
}

/**
 * Validate password strength
 * @param password - Password string to validate
 * @returns Object with validation results
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (!password || password.length < 8) {
    errors.push('رمز عبور باید حداقل 8 کاراکتر باشد');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('رمز عبور باید شامل حروف بزرگ باشد');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('رمز عبور باید شامل حروف کوچک باشد');
  }

  if (!/\d/.test(password)) {
    errors.push('رمز عبور باید شامل اعداد باشد');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('رمز عبور باید شامل کاراکترهای خاص باشد');
  }

  // Calculate strength
  if (password.length >= 12 && errors.length === 0) {
    strength = 'strong';
  } else if (password.length >= 8 && errors.length <= 2) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

/**
 * Secure token storage utility
 */
export class SecureTokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly EMAIL_KEY = 'auth_email';
  private static readonly ROLE_KEY = 'auth_role';
  
  /**
   * Store authentication token securely
   * @param token - JWT token
   */
  static setToken(token: string, useLocalStorage: boolean = false): void {
    if (typeof window !== 'undefined') {
      if (useLocalStorage) {
        localStorage.setItem(this.TOKEN_KEY, token);
      } else {
      sessionStorage.setItem(this.TOKEN_KEY, token);
      }
    }
  }
  
  /**
   * Get stored authentication token
   * @returns JWT token or null
   */
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(this.TOKEN_KEY) || localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }
  
  /**
   * Store user email
   * @param email - User email
   */
  static setEmail(email: string, useLocalStorage: boolean = false): void {
    if (typeof window !== 'undefined') {
      if (useLocalStorage) {
        localStorage.setItem(this.EMAIL_KEY, email);
      } else {
      sessionStorage.setItem(this.EMAIL_KEY, email);
      }
    }
  }
  
  /**
   * Get stored user email
   * @returns User email or null
   */
  static getEmail(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(this.EMAIL_KEY) || localStorage.getItem(this.EMAIL_KEY);
    }
    return null;
  }
  
  /**
   * Store user role
   * @param role - User role
   */
  static setRole(role: string, useLocalStorage: boolean = false): void {
    if (typeof window !== 'undefined') {
      if (useLocalStorage) {
        localStorage.setItem(this.ROLE_KEY, role);
      } else {
      sessionStorage.setItem(this.ROLE_KEY, role);
      }
    }
  }
  
  /**
   * Get stored user role
   * @returns User role or null
   */
  static getRole(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(this.ROLE_KEY) || localStorage.getItem(this.ROLE_KEY);
    }
    return null;
  }
  
  /**
   * Clear all authentication data
   */
  static clearAuth(): void {
    // پاک کردن همه کلیدهای احراز هویت از localStorage و sessionStorage
    const keys = [
      'auth_token',
      'auth_email',
      'auth_role',
      'faculty',
      'dormitory',
    ];
    keys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }
  
  /**
   * Check if user is authenticated
   * @returns True if token exists and is valid
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && token.length > 0;
  }
}

/**
 * Rate limiting utility for frontend
 */
export class RateLimiter {
  private static limits: Map<string, { count: number; resetTime: number }> = new Map();
  
  /**
   * Check if action is allowed (rate limited)
   * @param key - Unique key for the action
   * @param maxAttempts - Maximum attempts allowed
   * @param windowMs - Time window in milliseconds
   * @returns True if action is allowed
   */
  static isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const limit = this.limits.get(key);
    
    if (!limit || now > limit.resetTime) {
      // Reset or create new limit
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }
    
    if (limit.count >= maxAttempts) {
      return false;
    }
    
    limit.count += 1;
    return true;
  }
  
  /**
   * Clear rate limit for a key
   * @param key - Key to clear
   */
  static clear(key: string): void {
    this.limits.delete(key);
  }
  
  /**
   * Get remaining attempts for a key
   * @param key - Key to check
   * @param maxAttempts - Maximum attempts allowed
   * @returns Remaining attempts
   */
  static getRemainingAttempts(key: string, maxAttempts: number = 5): number {
    const limit = this.limits.get(key);
    if (!limit || Date.now() > limit.resetTime) {
      return maxAttempts;
    }
    return Math.max(0, maxAttempts - limit.count);
  }
} 

export class URLParameterValidator {
  private static readonly ALLOWED_PARAMS = new Set([
    'slug', 'id', 'page', 'category', 'search', 'sort', 'filter'
  ]);

  /**
   * Validates URL parameters and removes any unknown parameters
   * This prevents potential security vulnerabilities from unknown URL parameters
   */
  static validateAndCleanURL(): void {
    if (typeof window === 'undefined') return;

    try {
      const url = new URL(window.location.href);
      const searchParams = url.searchParams;
      let hasChanges = false;

      // Check each parameter
      for (const [key] of searchParams.entries()) {
        if (!this.ALLOWED_PARAMS.has(key)) {
          searchParams.delete(key);
          hasChanges = true;
          console.warn(`Removed unknown URL parameter: ${key}`);
        }
      }

      // Update URL if changes were made
      if (hasChanges) {
        const newUrl = url.toString();
        window.history.replaceState({}, '', newUrl);
      }
    } catch (error) {
      console.error('Error validating URL parameters:', error);
    }
  }

  /**
   * Checks if a URL parameter is allowed
   */
  static isParameterAllowed(param: string): boolean {
    return this.ALLOWED_PARAMS.has(param);
  }

  /**
   * Gets the list of allowed parameters
   */
  static getAllowedParameters(): string[] {
    return Array.from(this.ALLOWED_PARAMS);
  }
} 