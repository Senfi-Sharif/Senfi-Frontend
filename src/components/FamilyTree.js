import React from 'react';
import SharifCouncilDropDown from '@site/src/components/SharifCouncilDropDown';
import { groupedPeriods } from '@site/src/data/council-periods.js';
import { PeriodAccordion } from './PeriodAccordion';

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
    <div style={styles.statsContainer}>
      <div style={styles.statItem}>
        <div style={styles.statNumber}>👥 {displayNumber}</div>
        <div style={styles.statLabel}>تعداد کل اعضا</div>
      </div>
    </div>
  );
}

const FamilyTree = () => (
  <div style={styles.container}>
    <StatsPanel groupedPeriods={groupedPeriods} />
    
    {groupedPeriods.map((group, groupIndex) => (
      <PeriodAccordion 
        key={group.groupTitle} 
        title={group.groupTitle} 
        defaultOpen={false} // هیچ گروهی به صورت پیش‌فرض باز نباشه
        icon="📅"
      >
        {group.periods.map((council, periodIndex) => (
          <PeriodAccordion
            key={council.meta.period}
            title={council.meta.faTitle}
            defaultOpen={false} // هیچ دوره‌ای به صورت پیش‌فرض باز نباشه
            icon="👥"
          >
            {council.meta.description && (
              <div
                style={{ 
                  color: 'var(--ifm-color-primary-dark)', 
                  fontSize: '0.95rem', 
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--ifm-color-primary-lightest)',
                  lineHeight: '1.6'
                }}
                dangerouslySetInnerHTML={{ __html: council.meta.description }}
              />
            )}
            <SharifCouncilDropDown title="کارگروه‌ها" items={council.committees} />
            <SharifCouncilDropDown title="واحدها" items={council.units} />
          </PeriodAccordion>
        ))}
      </PeriodAccordion>
    ))}
  </div>
);

export default FamilyTree;
