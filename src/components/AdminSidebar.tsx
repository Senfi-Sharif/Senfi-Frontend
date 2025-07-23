import React, { useState, useEffect } from 'react';

interface AdminSidebarProps {
  current: 'blog' | 'campaign' | 'poll';
}

const links = [
  { key: 'blog', label: 'مدیریت بلاگ', href: '/admin/blog-management' },
  { key: 'campaign', label: 'مدیریت کارزارها', href: '/admin/campaign-management' },
  { key: 'poll', label: 'مدیریت نظرسنجی‌ها', href: '/admin/poll-management' },
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

const AdminSidebar: React.FC<AdminSidebarProps> = ({ current }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 800);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Always mount drawer on mobile, only unmount after close animation
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
          .admin-drawer-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.25);
            z-index: 1299;
            opacity: 1;
            transition: opacity 0.3s;
          }
          .admin-drawer-overlay.hide {
            opacity: 0;
            pointer-events: none;
          }
          .admin-drawer {
            position: fixed;
            top: 0; left: 0;
            height: 100vh;
            width: 260px;
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
          .admin-drawer.open {
            transform: translateX(0);
            opacity: 1;
            pointer-events: auto;
          }
        `}</style>
        <button
          aria-label="باز کردن منوی مدیریت"
          style={fabStyle}
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
        {drawerVisible && (
          <div
            className={`admin-drawer-overlay${menuOpen ? '' : ' hide'}`}
            onClick={() => setMenuOpen(false)}
          />
        )}
        {/* drawer همیشه mount است */}
        <div
          className={`admin-drawer${menuOpen ? ' open' : ''}`}
        >
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
                      display: 'block',
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
        width: 220,
        background: 'var(--ifm-background-surface-color)',
        borderLeft: '1px solid var(--ifm-color-emphasis-200)',
        padding: '2rem 0 2rem 0',
        position: 'sticky',
        top: 0,
        height: '100vh',
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
                  display: 'block',
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
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar; 