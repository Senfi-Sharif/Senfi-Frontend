import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';

export default function Modal({ open, onClose, children }) {
  const { colorMode } = useColorMode ? useColorMode() : { colorMode: 'light' };
  const isDark = colorMode === 'dark';
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: isDark ? 'rgba(0,0,0,0.64)' : 'rgba(0,0,0,0.32)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      direction: 'rtl',
    }} onClick={onClose}>
      <div style={{
        background: isDark ? 'var(--ifm-background-surface-color, #23263a)' : '#fff',
        color: isDark ? 'var(--ifm-font-color-base, #f3f6fa)' : 'inherit',
        borderRadius: '1.5rem',
        boxShadow: isDark ? '0 4px 32px #0008' : '0 4px 32px #0002',
        padding: '2.2rem 1.5rem 1.7rem 1.5rem',
        minWidth: 320,
        maxWidth: '90vw',
        minHeight: 120,
        position: 'relative',
        zIndex: 2100,
        fontFamily: 'inherit',
        border: isDark ? '1.5px solid #637eda' : 'none',
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute',
          left: 18,
          top: 18,
          background: 'none',
          border: 'none',
          fontSize: 22,
          color: isDark ? '#ef5350' : '#b71c1c',
          cursor: 'pointer',
          fontWeight: 900,
        }} aria-label="بستن">×</button>
        {children}
      </div>
    </div>
  );
} 