import React, { useState } from 'react';
import { useColorMode } from '@docusaurus/theme-common';

// استایل‌های مدرن و قابل تنظیم
const baseStyles = {
  container: {
    margin: "1.5rem 0",
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

/**
 * SenfiAccordion: یک آکوردیون ری‌یوزبل برای همه صفحات
 * Props:
 *   - title: عنوان
 *   - icon: آیکون (اختیاری)
 *   - children: محتوای بازشونده
 *   - defaultOpen: باز بودن پیش‌فرض
 *   - styleOverrides: امکان سفارشی‌سازی استایل‌ها (اختیاری)
 */
export default function SenfiAccordion({
  title,
  icon = null,
  children,
  defaultOpen = false,
  styleOverrides = {},
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [isHovered, setIsHovered] = useState(false);
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  // رنگ‌ها و استایل‌های داینامیک
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
    ? 'rgba(134, 140, 175, 0.95)'
    : '#fff';
  const buttonHoverColor = '#222';
  const contentBg = isDark ? 'rgba(30,34,54,0.85)' : 'rgba(255, 255, 255, 0.5)';
  const arrowColor = isDark ? 'var(--ifm-color-primary-light)' : 'var(--ifm-color-primary)';

  // امکان override استایل‌ها
  const mergedStyles = {
    ...baseStyles,
    ...styleOverrides,
  };

  return (
    <>
      <style>{slideDownAnimation}</style>
      <div
        style={{
          ...mergedStyles.container,
          background: containerBg,
          border: containerBorder,
        }}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            ...mergedStyles.button(open),
            background: isHovered ? buttonHoverBg : buttonBg,
            color: isHovered ? buttonHoverColor : buttonColor,
            ...(isHovered && mergedStyles.buttonHover),
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-expanded={open}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {icon && <span style={mergedStyles.icon}>{icon}</span>}
            <span>{title}</span>
          </div>
          <span style={{ ...mergedStyles.arrow(open), color: arrowColor }}>▼</span>
        </button>
        {open && (
          <div style={{ ...mergedStyles.content, background: contentBg }}>
            {children}
          </div>
        )}
      </div>
    </>
  );
} 