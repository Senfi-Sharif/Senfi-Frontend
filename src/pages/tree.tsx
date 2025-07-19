import React from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import { groupedPeriods } from '../data/council-periods.js';
import SenfiAccordion from '../components/SenfiAccordion';
import StatsPanel from '../components/StatsPanel';
import { useEffect, useState } from 'react';
import { FaUsers, FaRegCalendarAlt, FaBuilding } from 'react-icons/fa';

// Import DOMPurify with proper fallback
let DOMPurify: any = null;
if (typeof window !== 'undefined') {
  try {
    DOMPurify = require('dompurify');
  } catch (error) {
    console.warn('DOMPurify not available, using fallback sanitization');
  }
}

// Fallback sanitization function
function sanitizeHTML(html: string): string {
  if (DOMPurify) {
    return DOMPurify.sanitize(html);
  }
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

function TreeContent() {
  // محاسبه تعداد کل اعضا
  const totalMembers = groupedPeriods.reduce((acc, group) => 
    acc + group.periods.reduce((sum, period) => {
      const committeeMembers = (period.committees || []).reduce((s, committee) => 
        s + (committee.members || []).length, 0);
      const unitMembers = (period.units || []).reduce((s, unit) => 
        s + (unit.members || []).length, 0);
      return sum + committeeMembers + unitMembers;
    }, 0), 0);

  const approximateMembers = Math.round(totalMembers / 100) * 100;
  const displayNumber = `+${approximateMembers}`;

  return (
    <div className="senfi-page-container">
          <StatsPanel
            stats={[
              { icon: <FaUsers />, label: 'تعداد کل اعضا', value: displayNumber },
            ]}
          />
          {groupedPeriods.map((group, groupIndex) => (
            <SenfiAccordion
              key={group.groupTitle}
              title={group.groupTitle}
              defaultOpen={false}
              icon={<FaRegCalendarAlt />}
            >
              {group.periods.map((council, periodIndex) => (
                <SenfiAccordion
                  key={council.meta.period}
                  title={council.meta.faTitle}
                  defaultOpen={false}
                  icon={<FaUsers />}
                >
                  {council.meta.description && (
                    <div
                      className="council-description"
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(council.meta.description) }}
                    />
                  )}
                  {/* Committees List - کارت ستونی */}
                  {council.committees && council.committees.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>کارگروه‌ها:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                        {council.committees.map((committee, idx) => (
                          <div key={idx} className="committee-card">
                            <div className="committee-title" style={{ fontWeight: 700, marginBottom: 8, fontSize: '1.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <FaUsers /> {committee.title || committee.name}
                            </div>
                            {committee.members && committee.members.length > 0 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {committee.members.map((member, mIdx) => (
                                  <div key={mIdx} className="member-name" style={{ fontSize: '0.98em', marginBottom: 2 }}>
                                    {member.name}
                                    {member.role && (
                                      <span className="member-role">({member.role})</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Units List - کارت ستونی */}
                  {council.units && council.units.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>واحدها:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                        {council.units
                          .filter(unit => (unit.members && unit.members.length > 0) || unit.note)
                          .map((unit, idx) => (
                            <div key={idx} className="unit-card">
                              <div className="unit-title" style={{ fontWeight: 700, marginBottom: 8, fontSize: '1.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FaBuilding /> {unit.title || unit.name}
                              </div>
                              {unit.note && (
                                <div className="unit-note">{unit.note}</div>
                              )}
                              {unit.members && unit.members.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  {unit.members.map((member, mIdx) => (
                                    <div key={mIdx} className="member-name" style={{ fontSize: '0.98em', marginBottom: 2 }}>
                                      {member.name}
                                      {member.role && (
                                        <span className="member-role">({member.role})</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </SenfiAccordion>
              ))}
            </SenfiAccordion>
          ))}
    </div>
  );
}

export default function TreePage() {
  return (
    <Layout title="شجره‌نامه شورا" description="تاریخچه کامل ادوار، کارگروه‌ها و واحدهای شورای صنفی دانشجویان شریف">
      <Head>
        <title>شجره‌نامه شورا | شورای صنفی دانشجویان دانشگاه صنعتی شریف</title>
        <meta name="description" content="تاریخچه کامل ادوار، کارگروه‌ها و واحدهای شورای صنفی دانشجویان دانشگاه صنعتی شریف" />
        <meta property="og:image" content="https://senfi-sharif.ir/img/shora-og.png" />
        <meta property="og:title" content="شجره‌نامه شورای صنفی شریف" />
        <meta property="og:description" content="تاریخچه کامل ادوار، کارگروه‌ها و واحدهای شورا" />
        <meta property="og:url" content="https://senfi-sharif.ir/tree" />
      </Head>
      <TreeContent />
    </Layout>
  );
} 