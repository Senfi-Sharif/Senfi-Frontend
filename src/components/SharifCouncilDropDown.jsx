import React, { useState } from "react";
import { useColorMode } from '@docusaurus/theme-common';

// استایل‌های مدرن و بهبود یافته
const styles = {
  dropdownRoot: {
  direction: 'rtl',
  fontFamily: 'IRANYekan,Vazirmatn,Shabnam,Tahoma,Arial,sans-serif',
    margin: "2rem 0",
  textAlign: 'center',
  background: 'unset'
  },
  dropBtn: (isOpen) => ({
    margin: "0 auto 1.5rem auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
    gap: "0.75rem",
  background: isOpen
      ? "linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-dark) 100%)"
      : "linear-gradient(135deg, var(--ifm-color-primary-lightest) 0%, var(--ifm-color-primary-lighter) 100%)",
    color: isOpen ? "#fff" : "var(--ifm-color-primary-dark)",
  border: "none",
    borderRadius: "1.5rem",
    fontSize: "1.1rem",
    fontWeight: 700,
  fontFamily: "inherit",
    padding: "0.75rem 2rem",
  cursor: "pointer",
    boxShadow: !isOpen ? "0 4px 20px rgba(0, 0, 0, 0.1)" : "0 2px 10px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    outline: 'none',
    minWidth: '200px',
  }),
  dropBtnHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
  },
  dropArrow: (isOpen) => ({
    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  display: "inline-block",
    transform: isOpen ? "rotate(-90deg)" : "rotate(0)",
    fontSize: '1rem',
  }),
  cardsContainer: {
    marginTop: "1.5rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "1.5rem",
    justifyContent: 'center',
    alignItems: 'flex-start',
    animation: 'fadeInUp 0.4s ease-out',
  },
  cardStyle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '250px',
    maxWidth: '320px',
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '1rem',
    border: '1px solid var(--ifm-color-primary-lightest)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    backdropFilter: "blur(10px)",
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: 'relative',
  },
  cardHoverStyle: {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
  },
  cardHeader: {
    width: '100%',
    padding: '1rem 0 0.75rem 0',
    background: 'linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-light) 100%)',
    color: '#fff',
    fontWeight: 700,
    fontSize: "1rem",
  fontFamily: 'inherit',
    position: "relative",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  cardIcon: {
    fontSize: '1.2em',
    marginBottom: "-2px",
    marginRight: "0.5rem",
    verticalAlign: "middle",
    filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))",
  },
  memberList: {
    listStyle: "none",
    padding: "1rem 0.5rem",
    margin: 0,
    width: '100%',
    minHeight: '2rem',
  },
  memberStyle: (isMain) => ({
    margin: "0.5rem 0",
    fontWeight: isMain ? 700 : 500,
    color: isMain ? "var(--ifm-color-primary-darker)" : "var(--ifm-color-primary-dark)",
    fontFamily: "inherit",
    fontSize: "0.95rem",
    borderRadius: "0.5rem",
    padding: isMain ? "0.5rem 0.75rem" : "0.4rem 0.6rem",
    background: isMain ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.4)",
    boxShadow: isMain ? "0 2px 8px rgba(0, 0, 0, 0.1)" : "none",
    display: "inline-block",
    transition: "all 0.2s ease",
    border: isMain ? '1px solid var(--ifm-color-primary-lightest)' : 'none',
  }),
  memberHover: {
    transform: 'translateX(-3px)',
    boxShadow: '0 3px 12px rgba(0, 0, 0, 0.15)',
  },
};

// CSS Animations
const animations = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export default function SharifCouncilDropDown({ title, items = [], defaultOpen = false }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [hovered, setHovered] = useState(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <>
      <style>{animations}</style>
      <div style={styles.dropdownRoot}>
      <button
          style={{
            ...styles.dropBtn(open),
            ...(isButtonHovered && styles.dropBtnHover),
            background: open
              ? 'linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-dark) 100%)'
              : (isDark
                  ? 'linear-gradient(135deg, #23263a 0%, #181a23 100%)'
                  : 'linear-gradient(135deg, var(--ifm-color-primary-lightest) 0%, var(--ifm-color-primary-lighter) 100%)'),
            color: open ? '#fff' : (isDark ? 'var(--ifm-color-primary-lightest)' : 'var(--ifm-color-primary-dark)'),
          }}
        onClick={() => setOpen(o => !o)}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
        aria-expanded={open}
        aria-controls={"drop-sec-" + title}
      >
          <span style={styles.dropArrow(open)}>
            <svg width="20" height="12" viewBox="0 0 20 12">
              <path d="M2 2L10 10L18 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </span>
        {title}
      </button>
      {open && (
        <div
          id={"drop-sec-" + title}
            style={styles.cardsContainer}
        >
          {items.map((group, idx) =>
            <div
              style={{
                  ...styles.cardStyle,
                  ...(hovered === idx && styles.cardHoverStyle),
                  background: isDark ? 'rgba(30,34,54,0.95)' : 'rgba(255,255,255,0.9)',
                  border: isDark ? '1px solid #637eda' : '1px solid var(--ifm-color-primary-lightest)',
                  color: isDark ? 'var(--ifm-color-primary-lightest)' : 'var(--ifm-color-primary-dark)',
              }}
              key={idx}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
            >
                <div style={{
                  ...styles.cardHeader,
                  background: isDark
                    ? 'linear-gradient(135deg, #23263a 0%, #181a23 100%)'
                    : 'linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-light) 100%)',
                  color: '#fff',
                }}>
                  {group.type === "unit" ? 
                    <span style={styles.cardIcon}>🏢</span> : 
                    <span style={styles.cardIcon}>👥</span>
                  }
                {group.name}
              </div>
                <ul style={styles.memberList}>
                  {(group.members || []).map((mem, j) => {
                    const isMain = mem.type === "main" || mem.role === "دبیر";
                    return (
                      <li 
                        key={j} 
                        style={{
                          ...styles.memberStyle(isMain),
                          ...(hovered === idx && isMain && styles.memberHover),
                          background: isMain
                            ? (isDark ? 'rgba(40,44,64,0.95)' : 'rgba(255,255,255,0.8)')
                            : (isDark ? 'rgba(30,34,54,0.7)' : 'rgba(255,255,255,0.4)'),
                          color: isMain
                            ? (isDark ? 'var(--ifm-color-primary-lightest)' : 'var(--ifm-color-primary-darker)')
                            : (isDark ? 'var(--ifm-color-primary-light)' : 'var(--ifm-color-primary-dark)'),
                          border: isMain
                            ? (isDark ? '1px solid #637eda' : '1px solid var(--ifm-color-primary-lightest)')
                            : 'none',
                        }}
                      >
                        {isMain ? "⭐ " : ""}
                    {mem.name}
                    {mem.role ? ` (${mem.role})` : ""}
                  </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
