import React, { useState } from 'react';
import { useColorMode } from '@docusaurus/theme-common';

// استایل‌های مدرن و بهبود یافته
const styles = {
  container: {
    margin: "1.5rem 0",
    background: "rgba(255, 255, 255, 0.8)",
    borderRadius: "1rem",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    direction: 'rtl',
    border: '1px solid var(--ifm-color-primary-lightest)',
    transition: 'all 0.3s ease',
  },
  button: (open) => ({
    fontSize: '1.1rem',
    fontWeight: 700,
    color: open ? "var(--ifm-color-primary-darker)" : "var(--ifm-color-primary-dark)",
    background: open 
      ? "linear-gradient(135deg, var(--ifm-color-primary-lightest) 0%, var(--ifm-color-primary-lighter) 100%)" 
      : "rgba(255, 255, 255, 0.9)",
    border: "none",
    padding: "1.2rem 1.5rem",
    width: "100%",
    textAlign: "right",
    cursor: "pointer",
    outline: "none",
    borderBottom: open ? "2px solid var(--ifm-color-primary-lightest)" : "none",
    transition: "all 0.3s ease",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),
  buttonHover: {
    background: "linear-gradient(135deg, var(--ifm-color-primary-lightest) 0%, var(--ifm-color-primary-lighter) 100%)",
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
  },
  icon: {
    fontSize: '1.2rem',
    marginLeft: '0.5rem',
    opacity: 0.8,
  },
  arrow: (open) => ({
    marginLeft: '0.5rem',
    display: "inline-block",
    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: open ? "rotate(180deg)" : "rotate(0deg)",
    fontSize: '1rem',
    color: 'var(--ifm-color-primary)',
  }),
  content: {
    padding: "1rem 1.5rem",
    background: 'rgba(255, 255, 255, 0.5)',
    animation: 'slideDown 0.3s ease-out',
  },
};

// CSS Animation
const slideDownAnimation = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export function PeriodAccordion({ title, children, defaultOpen = false, icon = "📋" }) {
  const [open, setOpen] = useState(defaultOpen);
  const [isHovered, setIsHovered] = useState(false);
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  // Dynamic styles for dark mode
  const containerBg = isDark ? 'rgba(20,22,34,0.98)' : 'rgba(255, 255, 255, 0.8)';
  const containerBorder = isDark ? '1px solid #637eda' : '1px solid var(--ifm-color-primary-lightest)';
  const buttonBg = open
    ? (isDark
        ? 'linear-gradient(135deg, #23263a 0%, #181a23 100%)'
        : 'linear-gradient(135deg, var(--ifm-color-primary-lightest) 0%, var(--ifm-color-primary-lighter) 100%)')
    : (isDark
        ? 'rgba(30,34,54,0.95)'
        : 'rgba(255, 255, 255, 0.9)');
  const buttonColor = open
    ? (isDark ? 'var(--ifm-color-primary-lightest)' : 'var(--ifm-color-primary-darker)')
    : (isDark ? 'var(--ifm-color-primary-light)' : 'var(--ifm-color-primary-dark)');
  const buttonHoverBg = isDark
    ? 'linear-gradient(135deg, #23263a 0%, #181a23 100%)'
    : 'linear-gradient(135deg, var(--ifm-color-primary-lightest) 0%, var(--ifm-color-primary-lighter) 100%)';
  const contentBg = isDark ? 'rgba(30,34,54,0.85)' : 'rgba(255, 255, 255, 0.5)';
  const arrowColor = isDark ? 'var(--ifm-color-primary-light)' : 'var(--ifm-color-primary)';

  return (
    <>
      <style>{slideDownAnimation}</style>
    <div style={{
        ...styles.container,
        background: containerBg,
        border: containerBorder,
        ...(isHovered && !open && { transform: 'translateY(-2px)', boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)' })
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
            ...styles.button(open),
            background: isHovered ? buttonHoverBg : buttonBg,
            color: buttonColor,
            ...(isHovered && styles.buttonHover)
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        aria-expanded={open}
      >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={styles.icon}>{icon}</span>
            <span>{title}</span>
          </div>
          <span style={{ ...styles.arrow(open), color: arrowColor }}>▼</span>
      </button>
      {open && (
          <div style={{ ...styles.content, background: contentBg }}>
          {children}
        </div>
      )}
    </div>
    </>
  );
}
