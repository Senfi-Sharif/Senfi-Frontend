import React, { useState, useEffect } from 'react';
import { useAuthApi } from '../api/auth';
import { useColorMode } from '@docusaurus/theme-common';
import { FaBars, FaTimes } from 'react-icons/fa';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { colorMode, setColorMode } = useColorMode();
  const authApi = useAuthApi();

  // Dynamic styles for dark mode
  const isDark = colorMode === 'dark';
  const headerBg = isDark ? 'rgba(20, 22, 34, 0.98)' : 'rgba(255, 255, 255, 0.95)';
  const headerBorder = isDark ? '1px solid rgba(99, 126, 218, 0.12)' : '1px solid rgba(36, 75, 185, 0.1)';
  const navLinkColor = isDark ? 'var(--ifm-color-primary-light)' : '#16337c';
  const navLinkHoverBg = isDark ? 'rgba(99, 126, 218, 0.08)' : 'rgba(36, 75, 185, 0.1)';
  const navLinkHoverColor = isDark ? 'var(--ifm-color-primary)' : '#244bb9';
  const logoTextColor = isDark ? 'var(--ifm-color-primary-light)' : '#16337c';
  const userButtonBg = isDark ? 'rgba(30,34,54,0.95)' : '#fff';
  const userButtonColor = isDark ? 'var(--ifm-color-primary-light)' : '#16337c';
  const userButtonBorder = isDark ? '1.5px solid #637eda' : '1.5px solid #bfcbe6';
  const userButtonHoverBg = isDark ? 'rgba(99,126,218,0.12)' : '#f8f9ff';
  const userButtonHoverBorder = isDark ? '1.5px solid var(--ifm-color-primary)' : '1.5px solid #244bb9';
  const dropdownMenuBg = isDark ? 'rgba(30,34,54,0.98)' : '#fff';
  const dropdownMenuBorder = isDark ? '1px solid #637eda' : '1px solid rgba(36, 75, 185, 0.1)';
  const dropdownItemColor = isDark ? 'var(--ifm-color-primary-light)' : '#16337c';
  const dropdownItemHoverBg = isDark ? 'rgba(99,126,218,0.12)' : '#f8f9ff';
  const themeToggleColor = isDark ? 'var(--ifm-color-primary-light)' : '#16337c';
  const themeToggleBorder = isDark ? '1.5px solid #637eda' : '1.5px solid #bfcbe6';

  useEffect(() => {
    setIsAdmin(authApi.hasAdminAccess());
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
    <>
      <style>{`
        @media (max-width: 800px) {
          .header-nav-section { display: none !important; }
          .header-hamburger { display: flex !important; }
        }
        @media (min-width: 801px) {
          .header-hamburger { display: none !important; }
        }
        .header-mobile-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(20,22,34,0.55);
          z-index: 3999;
          transition: opacity 0.25s;
        }
        .header-mobile-menu {
          position: fixed;
          top: 0; right: 0;
          height: 100vh;
          width: 82vw;
          max-width: 340px;
          background: ${headerBg};
          z-index: 4000;
          box-shadow: -8px 0 32px rgba(0,0,0,0.18);
          border-bottom: ${headerBorder};
          border-top-left-radius: 1.5rem;
          border-bottom-left-radius: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          padding: 1.2rem 1.2rem 1.5rem 1.2rem;
          animation: slideInMenu 0.32s cubic-bezier(0.4,0,0.2,1);
        }
        .header-mobile-menu a, .header-mobile-menu button {
          margin: 0.7rem 0;
          font-size: 1.13rem;
          text-align: right;
          border-radius: 0.7rem;
          box-shadow: 0 2px 10px rgba(99,126,218,0.07);
          padding: 0.7rem 1rem;
          background: none;
          border: none;
          transition: background 0.18s, color 0.18s;
        }
        .header-mobile-menu a:hover, .header-mobile-menu button:hover {
          background: ${isDark ? 'rgba(99,126,218,0.13)' : 'rgba(36,75,185,0.08)'};
          color: ${isDark ? 'var(--ifm-color-primary-lightest)' : '#244bb9'};
        }
        .header-mobile-menu .close-btn {
          align-self: flex-end;
          background: none;
          border: none;
          font-size: 2.2rem;
          color: #e53935;
          margin-bottom: 1.2rem;
          margin-top: 0.2rem;
          cursor: pointer;
          border-radius: 50%;
          transition: background 0.18s;
        }
        .header-mobile-menu .close-btn:hover {
          background: rgba(229,57,53,0.08);
        }
        @keyframes slideInMenu {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <header style={{
        ...styles.headerContainer,
        background: headerBg,
        borderBottom: headerBorder,
      }}>
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
            <h1 style={{ ...styles.logoText, color: logoTextColor }}>شورای صنفی</h1>
          </div>
        </a>
        {/* منوی ناوبری دسکتاپ */}
        <nav className="header-nav-section" style={styles.navSection}>
          <a href="/tree" style={{ ...styles.navLink, color: navLinkColor }}
            onMouseEnter={e => {
              e.currentTarget.style.background = navLinkHoverBg;
              e.currentTarget.style.color = navLinkHoverColor;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = navLinkColor;
            }}
          >شجره‌نامه</a>
          <a href="/publications" style={{ ...styles.navLink, color: navLinkColor }}
            onMouseEnter={e => {
              e.currentTarget.style.background = navLinkHoverBg;
              e.currentTarget.style.color = navLinkHoverColor;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = navLinkColor;
            }}
          >نشریه شورا</a>
          {isLoggedIn && (
            <a href="/campaigns" style={{ ...styles.navLink, color: navLinkColor }}
              onMouseEnter={e => {
                e.currentTarget.style.background = navLinkHoverBg;
                e.currentTarget.style.color = navLinkHoverColor;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = navLinkColor;
              }}
            >کارزارها</a>
          )}
          {isAdmin && (
            <a href="/campaign-review" style={{ ...styles.navLink, color: navLinkColor }}
              onMouseEnter={e => {
                e.currentTarget.style.background = navLinkHoverBg;
                e.currentTarget.style.color = navLinkHoverColor;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = navLinkColor;
              }}
            >بررسی کارزارها</a>
          )}
        </nav>
        {/* Hamburger icon for mobile */}
        <button className="header-hamburger" style={{ display: 'none', background: 'none', border: 'none', fontSize: 28, color: logoTextColor, alignItems: 'center', cursor: 'pointer' }} onClick={() => setMobileMenuOpen(true)} aria-label="باز کردن منو">
          <FaBars />
        </button>
        {/* بخش کاربر دسکتاپ */}
        <div style={styles.userSection} className="header-nav-section">
          {/* دکمه دارک مود */}
          <button
            onClick={toggleTheme}
            style={{
              ...styles.themeToggle,
              color: themeToggleColor,
              border: themeToggleBorder,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = isDark ? '#637eda' : '#244bb9';
              e.currentTarget.style.background = isDark ? 'rgba(99,126,218,0.12)' : '#f8f9ff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = themeToggleBorder.split(' ')[2];
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
                  background: userButtonBg,
                  color: userButtonColor,
                  border: userButtonBorder,
                  ...(dropdownOpen && { background: userButtonHoverBg, border: userButtonHoverBorder }),
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = userButtonHoverBorder.split(' ')[2];
                  e.currentTarget.style.background = userButtonHoverBg;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = userButtonBorder.split(' ')[2];
                  e.currentTarget.style.background = userButtonBg;
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
                <div style={{
                  ...styles.dropdownMenu,
                  background: dropdownMenuBg,
                  border: dropdownMenuBorder,
                }}>
                  <a 
                    href="/profile" 
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      ...styles.dropdownItem,
                      color: dropdownItemColor,
                      background: 'transparent',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = dropdownItemHoverBg;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    پروفایل
                  </a>
                  <button 
                    onClick={handleLogout}
                    style={{
                      ...styles.dropdownItem,
                      ...styles.logoutButton,
                      color: '#fff',
                      background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#c62828';
                    }}
                    onMouseLeave={e => {
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
              style={{
                ...styles.loginButton,
                background: userButtonBg,
                color: userButtonColor,
                border: userButtonBorder,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = userButtonHoverBorder.split(' ')[2];
                e.currentTarget.style.background = userButtonHoverBg;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = userButtonBorder.split(' ')[2];
                e.currentTarget.style.background = userButtonBg;
              }}
            >
              ورود / ثبت‌نام
            </button>
          )}
        </div>
      </header>
      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <>
          <div className="header-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
          <div className="header-mobile-menu">
            <button className="close-btn" onClick={() => setMobileMenuOpen(false)} aria-label="بستن منو"><FaTimes /></button>
            <a href="/tree">شجره‌نامه</a>
            <a href="/publications">نشریه شورا</a>
            {isLoggedIn && <a href="/campaigns">کارزارها</a>}
            {isAdmin && <a href="/campaign-review">بررسی کارزارها</a>}
            <button onClick={toggleTheme} style={{ color: themeToggleColor }}>{colorMode === 'dark' ? '☀️ حالت روشن' : '🌙 حالت تاریک'}</button>
            {isLoggedIn ? (
              <button onClick={onLogout} style={{ color: '#e53935', fontWeight: 600 }}>خروج</button>
            ) : (
              <button onClick={onLoginClick} style={{ color: themeToggleColor, fontWeight: 600 }}>ورود/ثبت‌نام</button>
            )}
          </div>
        </>
      )}
    </>
  );
} 