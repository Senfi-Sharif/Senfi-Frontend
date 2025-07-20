import React, { useState, useEffect } from 'react';
import { useAuthApi } from '../api/auth';
import { FaBars, FaTimes, FaSun, FaMoon, FaUser } from 'react-icons/fa';



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
  const [mobileMenuClosing, setMobileMenuClosing] = useState(false);
  const authApi = useAuthApi();
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  // Helper to detect mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsAdmin(authApi.hasAdminAccess());
    
    // Load theme from localStorage or use system preference
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
      
      // Set initial theme
    document.documentElement.setAttribute('data-theme', initialTheme);
    setTheme(initialTheme);

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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 800);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    localStorage.setItem('theme', newTheme);
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

  // Helper to open menu
  const openMobileMenu = () => {
    setMobileMenuOpen(true);
    setMobileMenuClosing(false);
  };

  // Helper to close menu with animation
  const closeMobileMenu = () => {
    setMobileMenuClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setMobileMenuClosing(false);
    }, 320); // match CSS animation duration
  };

  // Helper to get username from email
  function getEmailUsername(email: string) {
    if (!email) return '';
    const suffix = '@sharif.edu';
    return email.endsWith(suffix) ? email.slice(0, -suffix.length) : email;
  }

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
          <a href="/sharif-senfi-regulations" className="header-nav-link">آیین‌نامه داخلی شورا</a>
          {isLoggedIn && (
            <a href="/campaigns" className="header-nav-link">کارزارها</a>
          )}
          {isAdmin && (
            <a href="/campaign-review" className="header-nav-link">بررسی کارزارها</a>
          )}
        </nav>
        {/* Hamburger icon for mobile */}
        <button className="header-hamburger" onClick={openMobileMenu} aria-label="باز کردن منو">
          <FaBars />
        </button>
        {/* بخش کاربر دسکتاپ و آیکون موبایل */}
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
                {isMobile ? (
                  <>
                    <FaUser style={{ marginLeft: 4, fontSize: 18 }} />
                    <span className={`header-dropdown-arrow${dropdownOpen ? ' header-dropdown-arrow-open' : ''}`}>▼</span>
                  </>
                ) : (
                  <>
                    {isAdmin && <span className="admin-badge">ادمین</span>}
                    {userEmail}
                    <span className={`header-dropdown-arrow${dropdownOpen ? ' header-dropdown-arrow-open' : ''}`}>▼</span>
                  </>
                )}
              </button>
              {dropdownOpen && (
                <div
                  className="header-dropdown-menu"
                  style={isMobile
                    ? { position: 'absolute', top: '110%', left: '50%', right: 'auto', transform: 'translateX(-50%)', minWidth: '180px', maxWidth: '95vw', zIndex: 9999 }
                    : { position: 'absolute', top: '110%', left: 0, minWidth: '160px', zIndex: 10 }
                  }
                >
                  {isMobile && (
                    <div className="header-dropdown-profile-mobile">
                      {isAdmin && <span className="admin-badge">ادمین</span>}
                      <span className="header-dropdown-email" dir="ltr">{getEmailUsername(userEmail)}</span>
                    </div>
                  )}
                  <a 
                    href="/profile" 
                    onClick={() => setDropdownOpen(false)}
                    className="header-dropdown-item header-dropdown-profile"
                  >
                    پروفایل
                  </a>
                  <button 
                    className="header-dropdown-item header-dropdown-logout"
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
              className="header-login-button header-login-icon-btn"
              title="ورود / ثبت‌نام"
            >
              <span className="header-login-btn-text">ورود / ثبت‌نام</span>
              <FaUser className="header-login-btn-icon" />
            </button>
          )}
        </div>
      </header>
      {/* Mobile menu drawer */}
      {(mobileMenuOpen || mobileMenuClosing) && (
        <>
          <div className="header-mobile-overlay" onClick={closeMobileMenu} />
          <div className={`header-mobile-menu${mobileMenuClosing ? ' menu-closing' : ''}`}> 
            <button className="close-btn" onClick={closeMobileMenu} aria-label="بستن منو"><FaTimes /></button>
            <a href="/tree">شجره‌نامه</a>
            <a href="/publications">نشریه شورا</a>
            <a href="/sharif-senfi-regulations">آیین‌نامه شورا</a>
            {isLoggedIn && <a href="/campaigns">کارزارها</a>}
            {isAdmin && <a href="/campaign-review">بررسی کارزارها</a>}
            {isLoggedIn ? (
              <button onClick={onLogout} className="header-mobile-logout-button">خروج</button>
            ) : null}
          </div>
        </>
      )}
    </>
  );
} 