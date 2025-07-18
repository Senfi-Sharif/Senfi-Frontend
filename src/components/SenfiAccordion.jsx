import React, { useState } from 'react';

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
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`senfi-accordion-container${open ? ' senfi-accordion-open' : ''}`}>
      <button
        className={`senfi-accordion-btn${open ? ' senfi-accordion-btn-open' : ''}${isHovered ? ' senfi-accordion-btn-hover' : ''}`}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-expanded={open}
      >
        <div className="senfi-accordion-title-row">
          {icon && <span className="senfi-accordion-icon">{icon}</span>}
          <span className="senfi-accordion-title">{title}</span>
        </div>
        <span className={`senfi-accordion-arrow${open ? ' senfi-accordion-arrow-open' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="senfi-accordion-content">
          {children}
        </div>
      )}
    </div>
  );
} 