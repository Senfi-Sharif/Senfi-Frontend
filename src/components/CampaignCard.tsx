import React, { useState } from 'react';
import SignCampaignButtons from './SignCampaignButtons';
import CampaignSignatures from './CampaignSignatures';
import styles from '../css/campaignsStyles';

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString('fa-IR');
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
  return (
    <div
      key={c.id}
      style={{
        ...styles.campaignCard,
        ...(isHovered && styles.campaignCardHover)
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.campaignTitle}>{c.title}</div>
      <div style={styles.campaignDescription}>{c.description}</div>
      <div style={styles.campaignMeta}>
        {c.email && <span>📧 ثبت‌کننده: {c.email} | </span>}
        {c.created_at && <span>📅 تاریخ: {formatDate(c.created_at)}</span>}
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