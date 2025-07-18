import React, { useState, useEffect } from 'react';
import { useAuthApi } from '../api/auth';
import { FaBars, FaTimes, FaSun, FaMoon } from 'react-icons/fa';



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
  const authApi = useAuthApi();
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    setIsAdmin(authApi.hasAdminAccess());
    const currentTheme = document.documentElement.getAttribute('data-theme') as 'dark' | 'light';
    setTheme(currentTheme);

    const observer = new MutationObserver((mutationsList) => {
      for(const mutation of mutationsList) {
        if (mutation.attributeName === 'data-theme') {
          setTheme(document.documentElement.getAttribute('data-theme') as 'dark' | 'light');
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [userRole]);

  const handleLogout = () => {
    setDropdownOpen(false);
    onLogout();
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    setTheme(newTheme);
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
      <header className="header-container">
        {/* لوگو و عنوان */}
        <a href="/" className="header-logo-link">
          <div className="header-logo-section">
            <img 
              src="/img/maini_colors.png" 
              alt="شورای صنفی" 
              className="header-logo"
            />
            <h1 className="header-logo-text">شورای صنفی</h1>
          </div>
        </a>
        {/* منوی ناوبری دسکتاپ */}
        <nav className="header-nav-section">
          <a href="/tree" className="header-nav-link">شجره‌نامه</a>
          <a href="/publications" className="header-nav-link">نشریه شورا</a>
          {isLoggedIn && (
            <a href="/campaigns" className="header-nav-link">کارزارها</a>
          )}
          {isAdmin && (
            <a href="/campaign-review" className="header-nav-link">بررسی کارزارها</a>
          )}
        </nav>
        {/* Hamburger icon for mobile */}
        <button className="header-hamburger" onClick={() => setMobileMenuOpen(true)} aria-label="باز کردن منو">
          <FaBars />
        </button>
        {/* بخش کاربر دسکتاپ */}
        <div className="header-user-section header-nav-section">
          {/* دکمه دارک مود */}
          <button
            onClick={toggleTheme}
            className="header-theme-toggle"
            title="تغییر به حالت روشن/تاریک"
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>

          {isLoggedIn ? (
            <div className="header-dropdown-wrapper" data-dropdown>
              <button 
                onClick={toggleDropdown}
                className="header-dropdown-container user-button"
              >
                {isAdmin && <span className="admin-badge">ادمین</span>}
                {userEmail}
                <span className={`header-dropdown-arrow ${dropdownOpen ? 'header-dropdown-arrow-open' : ''}`}>
                  ▼
                </span>
              </button>
              {dropdownOpen && (
                <div className="dropdownMenu header-dropdown-menu" style={{ position: 'absolute', top: '110%', left: 0, minWidth: '160px', zIndex: 10 }}>
                  <a 
                    href="/profile" 
                    onClick={() => setDropdownOpen(false)}
                    className="header-dropdown-item header-dropdown-profile"
                  >
                    پروفایل
                  </a>
                  <button 
                    className="logoutButton header-dropdown-item header-dropdown-logout"
                    onClick={handleLogout}
                  >
                    خروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="header-login-button"
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
            <button onClick={toggleTheme} className="header-mobile-theme-button">{theme === 'dark' ? <FaSun /> : <FaMoon />} {theme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}</button>
            {isLoggedIn ? (
              <button onClick={onLogout} className="header-mobile-logout-button">خروج</button>
            ) : (
              <button onClick={onLoginClick} className="header-mobile-login-button">ورود/ثبت‌نام</button>
            )}
          </div>
        </>
      )}
    </>
  );
} 