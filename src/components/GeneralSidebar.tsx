import React, { useState, useEffect } from 'react';
import { FaBullhorn, FaPoll, FaBook } from 'react-icons/fa';

interface GeneralSidebarProps {
  current: 'campaigns' | 'polls' | 'blog';
}

const links = [
  { key: 'campaigns', label: 'کارزارها', href: '/campaigns', icon: <FaBullhorn /> },
  { key: 'polls', label: 'نظرسنجی‌ها', href: '/polls', icon: <FaPoll /> },
  { key: 'blog', label: 'بلاگ', href: '/blog', icon: <FaBook /> },
];

const fabStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 24,
  left: 24,
  zIndex: 1200,
  width: 56,
  height: 56,
  borderRadius: '50%',
  background: 'var(--ifm-color-primary)',
  color: '#fff',
  boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 32,
  border: 'none',
  cursor: 'pointer',
};

const ANIMATION_DURATION = 300;

const GeneralSidebar: React.FC<GeneralSidebarProps> = ({ current }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 800);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      setDrawerVisible(true);
    } else {
      const timeout = setTimeout(() => setDrawerVisible(false), ANIMATION_DURATION);
      return () => clearTimeout(timeout);
    }
  }, [menuOpen]);

  if (isMobile) {
    return (
      <>
        <style>{`
          .general-drawer-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.25);
            z-index: 1299;
            opacity: 1;
            transition: opacity 0.3s;
          }
          .general-drawer-overlay.hide {
            opacity: 0;
            pointer-events: none;
          }
          .general-drawer {
            position: fixed;
            top: 0; left: 0;
            height: 100vh;
            width: 220px;
            background: var(--ifm-background-surface-color);
            box-shadow: 2px 0 16px rgba(0,0,0,0.18);
            z-index: 1300;
            padding: 2rem 0;
            display: flex;
            flex-direction: column;
            transform: translateX(-100%);
            opacity: 0;
            transition: transform 0.3s, opacity 0.3s;
            pointer-events: none;
          }
          .general-drawer.open {
            transform: translateX(0);
            opacity: 1;
            pointer-events: auto;
          }
          .general-fab-mobile {
            left: 1.2rem !important;
          }
          @media (max-width: 768px) {
            .back-to-top-button {
              left: 5.5rem !important;
              right: auto !important;
            }
          }
          @media (min-width: 769px) {
            .general-fab-mobile {
              left: 24px !important;
            }
          }
        `}</style>
        <button
          aria-label="باز کردن منوی بخش‌ها"
          style={fabStyle}
          className="general-fab-mobile"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
        {drawerVisible && (
          <div
            className={`general-drawer-overlay${menuOpen ? '' : ' hide'}`}
            onClick={() => setMenuOpen(false)}
          />
        )}
        <div className={`general-drawer${menuOpen ? ' open' : ''}`}>
          <button
            aria-label="بستن منو"
            style={{ position: 'absolute', left: 12, top: 12, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--ifm-font-color-base)' }}
            onClick={() => setMenuOpen(false)}
          >
            ×
          </button>
          <nav style={{ marginTop: 40 }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {links.map(link => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '1rem 2rem',
                      color: current === link.key ? 'var(--ifm-color-primary)' : 'var(--ifm-font-color-base)',
                      background: current === link.key ? 'var(--ifm-color-primary-lightest)' : 'transparent',
                      fontWeight: current === link.key ? 700 : 500,
                      borderRight: current === link.key ? '4px solid var(--ifm-color-primary)' : '4px solid transparent',
                      borderRadius: '0 16px 16px 0',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                    aria-current={current === link.key ? 'page' : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.icon}
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside
      style={{
        width: 180,
        background: 'var(--ifm-background-surface-color)',
        borderLeft: '1px solid var(--ifm-color-emphasis-200)',
        padding: '2rem 0 2rem 0',
        position: 'sticky',
        top: 0,
        alignSelf: 'stretch',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        zIndex: 10,
      }}
    >
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {links.map(link => (
            <li key={link.key}>
              <a
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '1rem 2rem',
                  color: current === link.key ? 'var(--ifm-color-primary)' : 'var(--ifm-font-color-base)',
                  background: current === link.key ? 'var(--ifm-color-primary-lightest)' : 'transparent',
                  fontWeight: current === link.key ? 700 : 500,
                  borderRight: current === link.key ? '4px solid var(--ifm-color-primary)' : '4px solid transparent',
                  borderRadius: '0 16px 16px 0',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                aria-current={current === link.key ? 'page' : undefined}
              >
                {link.icon}
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default GeneralSidebar; 