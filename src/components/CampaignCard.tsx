import React, { useState } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import SignCampaignButtons from './SignCampaignButtons';
import CampaignSignatures from './CampaignSignatures';
import styles from '../css/campaignsStyles';

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

interface CampaignCardProps {
  c: any;
  isSigned?: boolean;
  userRole: string;
  handleSetPending: (id: number) => void;
  handleSignSuccess: (id: number) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ c, isSigned = false, userRole, handleSetPending, handleSignSuccess }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const cardBg = isDark ? 'rgba(30,34,54,0.98)' : 'rgba(255,255,255,0.95)';
  const cardBorder = isDark ? '1.5px solid #637eda' : '1px solid #e0e7ff';
  const textColor = isDark ? 'var(--ifm-font-color-base, #f3f6fa)' : '#222';
  const metaColor = isDark ? 'var(--ifm-color-primary-lightest)' : 'var(--ifm-color-primary-dark)';

  return (
    <div
      key={c.id}
      className="campaign-card"
      style={{
        background: cardBg,
        border: cardBorder,
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        padding: 24,
        marginBottom: 24,
        color: textColor,
        ...(isHovered && styles.campaignCardHover)
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{...styles.campaignTitle, color: textColor}}>{c.title}</div>
      <div style={{...styles.campaignDescription, color: textColor}}>{c.description}</div>
      <div style={{...styles.campaignMeta, color: metaColor}}>
        {c.email && <span>📧 ثبت‌کننده: {c.email} | </span>}
        {c.created_at && <span>📅 تاریخ: {formatDate(c.created_at)}</span>}
        {c.end_datetime && <span style={{marginRight: 8}}>⏰ پایان: {formatDate(c.end_datetime)}</span>}
      </div>
      <SignCampaignButtons
        campaignId={c.id}
        campaignIsAnonymous={c.is_anonymous || "public"}
        onSignatureSuccess={() => handleSignSuccess(c.id)}
      />
      <CampaignSignatures
        campaignId={c.id}
      />
      {(userRole === 'superadmin' || userRole === 'head') && (
        <button
          onClick={() => handleSetPending(c.id)}
          style={{
            marginRight: '1rem',
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(255, 152, 0, 0.2)',
            transition: 'all 0.2s',
          }}
        >
          بازگرداندن به بررسی
        </button>
      )}
    </div>
  );
};

export default CampaignCard; 