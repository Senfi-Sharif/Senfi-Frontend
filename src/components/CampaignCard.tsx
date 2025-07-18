import React, { useState } from 'react';
import SignCampaignButtons from './SignCampaignButtons';
import CampaignSignatures from './CampaignSignatures';
import styles, { campaignCardClosed, campaignCardEndedLabel } from '../css/campaignsStyles';
import { FaEnvelope, FaRegCalendarAlt, FaRegClock } from 'react-icons/fa';

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
  const now = new Date();
  const isClosed = c.end_datetime && new Date(c.end_datetime) < now;

  return (
    <div
      key={c.id}
      className={`campaign-card${isHovered ? ' campaign-card-hover' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* برچسب پایان یافته */}
      {isClosed && (
        <div className="campaign-card-ended-label" style={campaignCardEndedLabel}>این کارزار به پایان رسیده است</div>
      )}
      {/* Title row: remove inline sign status */}
      <div className="campaign-title">{c.title}</div>
      <div className="campaign-description">{c.description}</div>
      <div className={`campaign-meta${isClosed ? ' campaign-meta-closed' : ''}`}>
        {c.email && <span><FaEnvelope /> ثبت‌کننده: {c.email} | </span>}
        {c.created_at && <span><FaRegCalendarAlt /> تاریخ: {formatDate(c.created_at)}</span>}
        {c.end_datetime && <span className="campaign-end-date"><FaRegClock /> پایان: {formatDate(c.end_datetime)}</span>}
      </div>
      {!isClosed && (
        <SignCampaignButtons
          campaignId={c.id}
          campaignIsAnonymous={c.is_anonymous || "public"}
          onSignatureSuccess={() => handleSignSuccess(c.id)}
        />
      )}
      <CampaignSignatures
        campaignId={c.id}
      />
      {(userRole === 'superadmin' || userRole === 'head') && (
        <button
          onClick={() => handleSetPending(c.id)}
          className="campaign-admin-button"
        >
          بازگرداندن به بررسی
        </button>
      )}
    </div>
  );
};

export default CampaignCard; 