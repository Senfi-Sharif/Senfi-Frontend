import React from 'react';
import { groupedPeriods } from '@site/src/data/council-periods.js';
import SenfiAccordion from './SenfiAccordion';
import { useColorMode } from '@docusaurus/theme-common';

// استایل‌های مدرن و بهبود یافته
const styles = {
  container: {
    direction: 'rtl',
    textAlign: 'right',
    fontFamily: "inherit",
    maxWidth: '100%',
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem',
    padding: '1.5rem',
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '1rem',
    border: '1px solid var(--ifm-color-primary-lighter)',
  },
  statItem: {
    textAlign: 'center',
    padding: '1rem 2rem',
    background: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '0.5rem',
    border: '1px solid var(--ifm-color-primary-lightest)',
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: 'var(--ifm-color-primary)',
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '1rem',
    color: 'var(--ifm-color-primary-dark)',
    fontWeight: 500,
  },
};

// کامپوننت آمار ساده
function StatsPanel({ groupedPeriods }) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  // محاسبه تعداد کل اعضا
  const totalMembers = groupedPeriods.reduce((acc, group) => 
    acc + group.periods.reduce((sum, period) => {
      const committeeMembers = (period.committees || []).reduce((s, committee) => 
        s + (committee.members || []).length, 0);
      const unitMembers = (period.units || []).reduce((s, unit) => 
        s + (unit.members || []).length, 0);
      return sum + committeeMembers + unitMembers;
    }, 0), 0);

  // تبدیل به عدد حدودی - گرد کردن به نزدیک‌ترین ۱۰۰
  const approximateMembers = Math.round(totalMembers / 100) * 100;
  const displayNumber = `+${approximateMembers}`;

  return (
    <div style={{
      ...styles.statsContainer,
      background: isDark ? 'rgba(20,22,34,0.98)' : 'rgba(255,255,255,0.8)',
      border: isDark ? '1px solid #637eda' : '1px solid var(--ifm-color-primary-lighter)',
    }}>
      <div style={{
        ...styles.statItem,
        background: isDark ? 'rgba(30,34,54,0.95)' : 'rgba(255,255,255,0.5)',
        border: isDark ? '1px solid #637eda' : '1px solid var(--ifm-color-primary-lightest)',
        color: isDark ? 'var(--ifm-color-primary-light)' : 'var(--ifm-color-primary)',
      }}>
        <div style={{
          ...styles.statNumber,
          color: isDark ? 'var(--ifm-color-primary-light)' : 'var(--ifm-color-primary)',
        }}>👥 {displayNumber}</div>
        <div style={{
          ...styles.statLabel,
          color: isDark ? 'var(--ifm-color-primary-lightest)' : 'var(--ifm-color-primary-dark)',
        }}>تعداد کل اعضا</div>
      </div>
    </div>
  );
}

const FamilyTree = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  return (
    <div style={styles.container}>
      <StatsPanel groupedPeriods={groupedPeriods} />
      
      {groupedPeriods.map((group, groupIndex) => (
        <SenfiAccordion
          key={group.groupTitle}
          title={group.groupTitle}
          defaultOpen={false}
          icon="📅"
        >
          {group.periods.map((council, periodIndex) => (
            <SenfiAccordion
              key={council.meta.period}
              title={council.meta.faTitle}
              defaultOpen={false}
              icon="👥"
            >
              {council.meta.description && (
                <div
                  style={{ 
                    color: isDark ? 'var(--ifm-color-primary-lightest)' : 'var(--ifm-color-primary-dark)',
                    fontSize: '0.95rem', 
                    marginBottom: '1rem',
                    padding: '1rem',
                    background: isDark ? 'rgba(30,34,54,0.95)' : 'rgba(255,255,255,0.5)',
                    borderRadius: '0.5rem',
                    border: isDark ? '1px solid #637eda' : '1px solid var(--ifm-color-primary-lightest)',
                    lineHeight: '1.6'
                  }}
                  dangerouslySetInnerHTML={{ __html: council.meta.description }}
                />
              )}
              <SharifCouncilDropDown title="کارگروه‌ها" items={council.committees} />
              <SharifCouncilDropDown title="واحدها" items={council.units} />
            </SenfiAccordion>
          ))}
        </SenfiAccordion>
      ))}
    </div>
  );
};

export default FamilyTree;
