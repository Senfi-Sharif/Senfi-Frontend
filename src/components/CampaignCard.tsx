import React, { useState } from 'react';
import CampaignSignatures from './CampaignSignatures';
import styles, { campaignCardClosed, campaignCardEndedLabel } from '../css/campaignsStyles';
import { FaEnvelope, FaRegCalendarAlt, FaRegClock, FaTag } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

interface CampaignCardProps {
  c: any;
  isSigned?: boolean;
  userRole: string;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ c, isSigned = false, userRole }) => {
  const history = useHistory();
  const [isHovered, setIsHovered] = useState(false);
  const now = new Date();
  const isClosed = c.end_datetime && new Date(c.end_datetime) < now;

  return (
    <div
      key={c.id}
      className={`campaign-card${isHovered ? ' campaign-card-hover' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => history.push(`/campaign-detail?id=${c.id}`)}
      style={{ cursor: 'pointer' }}
    >
      {/* برچسب پایان یافته */}
      {isClosed && (
        <div className="campaign-card-ended-label" style={campaignCardEndedLabel}>این کارزار به پایان رسیده است</div>
      )}
      {/* برچسب موضوع کارزار */}
      {c.label && (
        <div className="campaign-label-badge">
          <FaTag style={{marginLeft: 6, marginBottom: -2, color: '#1e40af', opacity: 0.85}} />
          {c.label}
        </div>
      )}
      {/* Title row: remove inline sign status */}
      <div className="campaign-title">{c.title}</div>
      {c.excerpt && (
        <div className="campaign-excerpt" style={{ color: '#666', fontStyle: 'italic', marginBottom: '0.5rem' }}>
          {c.excerpt}
        </div>
      )}
      <div className="campaign-description">{c.description}</div>
      <div className={`campaign-meta${isClosed ? ' campaign-meta-closed' : ''}`}>
        {c.email && <span><FaEnvelope /> ثبت‌کننده: {c.email} | </span>}
        {c.created_at && <span><FaRegCalendarAlt /> تاریخ: {formatDate(c.created_at)}</span>}
        {c.end_datetime && <span className="campaign-end-date"><FaRegClock /> پایان: {formatDate(c.end_datetime)}</span>}
      </div>
      <CampaignSignatures
        campaignId={c.id}
      />
    </div>
  );
};

export default CampaignCard; 