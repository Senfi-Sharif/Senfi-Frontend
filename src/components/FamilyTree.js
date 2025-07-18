import React from 'react';
import { groupedPeriods } from '../data/council-periods.js';
import SenfiAccordion from './SenfiAccordion';
import StatsPanel from './StatsPanel';
import { container as sharedContainer } from '../theme/sharedStyles';

const FamilyTree = () => {
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
    <div className="family-tree-container">
      <StatsPanel
        stats={[
          { icon: '👥', label: 'تعداد کل اعضا', value: displayNumber },
        ]}
        // حذف background/border سفارشی، فقط sharedStyles
      />
      
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
                  className="council-description"
                >
                  {council.meta.description}
                </div>
              )}
              {/* Committees List */}
              {council.committees && council.committees.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>کارگروه‌ها:</div>
                  <ul style={{ paddingRight: 18, margin: 0 }}>
                    {council.committees.map((committee, idx) => (
                      <li key={idx} style={{ marginBottom: 2 }}>
                        <span style={{ fontWeight: 500 }}>{committee.title}</span>
                        {committee.members && committee.members.length > 0 && (
                          <span className="committee-count">
                            {' '}({committee.members.length} عضو)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Units List */}
              {council.units && council.units.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>واحدها:</div>
                  <ul style={{ paddingRight: 18, margin: 0 }}>
                    {council.units.map((unit, idx) => (
                      <li key={idx} style={{ marginBottom: 2 }}>
                        <span style={{ fontWeight: 500 }}>{unit.title}</span>
                        {unit.members && unit.members.length > 0 && (
                          <span className="unit-count">
                            {' '}({unit.members.length} عضو)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </SenfiAccordion>
          ))}
        </SenfiAccordion>
      ))}
    </div>
  );
};

export default FamilyTree;
