import React, { useState, useEffect } from 'react';
import { hasAdminAccess, getUserRole } from '@site/src/api/auth';
import { useColorMode } from '@docusaurus/theme-common';

// استایل‌های مشترک
const styles = {
  headerContainer: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 3000,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(36, 75, 185, 0.1)',
    padding: '0.5rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    objectFit: 'cover' as const,
  },
  logoText: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#16337c',
    margin: 0,
  },
  navSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  navLink: {
    color: '#16337c',
    textDecoration: 'none',
    fontWeight: 500,
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    transition: 'all 0.2s ease',
    fontSize: '0.9rem',
  },
  navLinkHover: {
    background: 'rgba(36, 75, 185, 0.1)',
    color: '#244bb9',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  userButton: {
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    padding: '0.5rem 1rem',
    borderRadius: '1.5rem',
    border: '1.5px solid #bfcbe6',
    background: '#fff',
    color: '#16337c',
    cursor: 'pointer',
    fontWeight: 600,
    minWidth: 140,
    textAlign: 'right' as const,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userButtonHover: {
    borderColor: '#244bb9',
    background: '#f8f9ff',
  },
  dropdownArrow: {
    fontSize: '1rem',
    marginRight: 8,
    transition: 'transform 0.2s ease',
  },
  dropdownMenu: {
    position: 'absolute' as const,
    left: 0,
    top: '110%',
    background: '#fff',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    borderRadius: '0.75rem',
    minWidth: 160,
    padding: '0.5rem',
    zIndex: 10,
    border: '1px solid rgba(36, 75, 185, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  dropdownItem: {
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    padding: '0.6rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    background: 'transparent',
    color: '#16337c',
    cursor: 'pointer',
    fontWeight: 500,
    width: '100%',
    textAlign: 'center' as const,
    textDecoration: 'none',
    display: 'block',
    transition: 'all 0.2s ease',
  },
  dropdownItemHover: {
    background: '#f8f9ff',
    color: '#244bb9',
  },
  profileButton: {
    background: '#244bb9',
    color: '#fff',
  },
  logoutButton: {
    background: '#e53935',
    color: '#fff',
  },
  loginButton: {
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    padding: '0.5rem 1rem',
    borderRadius: '1.5rem',
    border: '1.5px solid #bfcbe6',
    background: '#fff',
    color: '#16337c',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
  loginButtonHover: {
    borderColor: '#244bb9',
    background: '#f8f9ff',
  },
  adminBadge: {
    fontSize: '0.7rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '0.25rem',
    background: '#ff9800',
    color: '#fff',
    fontWeight: 600,
    marginRight: '0.5rem',
  },
  themeToggle: {
    background: 'transparent',
    border: '1.5px solid #bfcbe6',
    borderRadius: '50%',
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '1rem',
    color: '#16337c',
  },
  themeToggleHover: {
    borderColor: '#244bb9',
    background: '#f8f9ff',
  },
};

interface HeaderProps {
  isLoggedIn: boolean;
  userEmail: string;
  userRole: string;
  onLoginClick: () => void;
  onLogout: () => void;
}

export default function Header({ 
  isLoggedIn, 
  userEmail, 
  userRole, 
  onLoginClick, 
  onLogout 
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { colorMode, setColorMode } = useColorMode();

  useEffect(() => {
    setIsAdmin(hasAdminAccess());
  }, [userRole]);

  const handleLogout = () => {
    setDropdownOpen(false);
    onLogout();
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleTheme = () => {
    setColorMode(colorMode === 'dark' ? 'light' : 'dark');
  };

  // بستن dropdown با کلیک بیرون
  useEffect(() => {
    if (!dropdownOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-dropdown]')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header style={styles.headerContainer}>
      {/* لوگو و عنوان */}
      <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          ...styles.logoSection,
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        >
          <img 
            src="/img/maini_colors.png" 
            alt="شورای صنفی" 
            style={styles.logo}
          />
          <h1 style={styles.logoText}>شورای صنفی</h1>
        </div>
      </a>

      {/* منوی ناوبری */}
      <nav style={styles.navSection}>
        <a href="/tree" style={styles.navLink}>شجره‌نامه</a>
        <a href="/publications" style={styles.navLink}>نشریه شورا</a>
        {isLoggedIn && (
          <a href="/campaigns" style={styles.navLink}>کارزارها</a>
        )}
        {isAdmin && (
          <a href="/campaign-review" style={styles.navLink}>بررسی کارزارها</a>
        )}
      </nav>

            {/* بخش کاربر */}
      <div style={styles.userSection}>
        {/* دکمه دارک مود */}
        <button
          onClick={toggleTheme}
          style={styles.themeToggle}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#244bb9';
            e.currentTarget.style.background = '#f8f9ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#bfcbe6';
            e.currentTarget.style.background = 'transparent';
          }}
          title={colorMode === 'dark' ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'}
        >
          {colorMode === 'dark' ? '☀️' : '🌙'}
        </button>

        {isLoggedIn ? (
          <div style={{ position: 'relative' as const, display: 'inline-block' }} data-dropdown>
            <button 
              onClick={toggleDropdown}
              style={{
                ...styles.userButton,
                ...(dropdownOpen && styles.userButtonHover)
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#244bb9';
                e.currentTarget.style.background = '#f8f9ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#bfcbe6';
                e.currentTarget.style.background = '#fff';
              }}
            >
              {isAdmin && <span style={styles.adminBadge}>ادمین</span>}
              {userEmail}
              <span style={{
                ...styles.dropdownArrow,
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ▼
              </span>
            </button>
            
            {dropdownOpen && (
              <div style={styles.dropdownMenu}>
                <a 
                  href="/profile" 
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    ...styles.dropdownItem,
                    ...styles.profileButton
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1a3a8f';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#244bb9';
                  }}
                >
                  پروفایل
                </a>
                <button 
                  onClick={handleLogout}
                  style={{
                    ...styles.dropdownItem,
                    ...styles.logoutButton
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#c62828';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#e53935';
                  }}
                >
                  خروج
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            id="login-signup-btn"
            onClick={onLoginClick}
            style={styles.loginButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#244bb9';
              e.currentTarget.style.background = '#f8f9ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#bfcbe6';
              e.currentTarget.style.background = '#fff';
            }}
          >
            ورود / ثبت‌نام
          </button>
        )}
      </div>
    </header>
  );
} 