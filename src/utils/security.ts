/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(html: string): string {
  if (typeof window !== 'undefined') {
    // Use DOMPurify if available
    try {
      const DOMPurify = require('dompurify');
      return DOMPurify.sanitize(html);
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
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
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
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
    .slice(0, maxLength); // Limit length
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result with errors
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
  score: number; // 0-4 (weak to strong)
} {
  const errors: string[] = [];
  let score = 0;
  
  if (!password || typeof password !== 'string') {
    errors.push('رمز عبور الزامی است');
    return { isValid: false, errors, score: 0 };
  }
  
  // Length check
  if (password.length < 8) {
    errors.push('رمز عبور باید حداقل ۸ کاراکتر باشد');
  } else {
    score += 1;
  }
  
  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('رمز عبور باید شامل حروف بزرگ باشد');
  } else {
    score += 1;
  }
  
  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('رمز عبور باید شامل حروف کوچک باشد');
  } else {
    score += 1;
  }
  
  // Number check
  if (!/\d/.test(password)) {
    errors.push('رمز عبور باید شامل اعداد باشد');
  } else {
    score += 1;
  }
  
  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('رمز عبور باید شامل کاراکترهای خاص باشد');
  } else {
    score += 1;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(score, 4)
  };
}

/**
 * Get password strength label
 * @param score - Password strength score (0-4)
 * @returns Strength label
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'ضعیف';
    case 2:
      return 'متوسط';
    case 3:
      return 'قوی';
    case 4:
      return 'خیلی قوی';
    default:
      return 'نامشخص';
  }
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
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.EMAIL_KEY);
      sessionStorage.removeItem(this.ROLE_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.EMAIL_KEY);
      localStorage.removeItem(this.ROLE_KEY);
    }
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