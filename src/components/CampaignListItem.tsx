import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

interface CampaignListItemProps {
  campaign: {
    id: number;
    title: string;
    signed_at: string;
    is_anonymous: string;
    description?: string;
    end_datetime?: string;
  };
  showSignatureInfo?: boolean;
  showDescription?: boolean;
  showEndDate?: boolean;
  className?: string;
  onClick?: () => void;
}

const CampaignListItem: React.FC<CampaignListItemProps> = ({
  campaign,
  showSignatureInfo = true,
  showDescription = false,
  showEndDate = false,
  className = '',
  onClick
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const isEnded = campaign.end_datetime && new Date(campaign.end_datetime) < new Date();

  return (
    <div 
      className={`profile-signed-campaign-item ${className} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="profile-signed-campaign-title">
        <FaCheckCircle style={{marginLeft:4}}/>{campaign.title}
      </div>
      
      {showSignatureInfo && (
        <>
          <div className="profile-faded">
            تاریخ امضا: {formatDate(campaign.signed_at)}
          </div>
          <div className="profile-faded">
            نوع امضا: {campaign.is_anonymous === "anonymous" ? "ناشناس" : "عمومی"}
          </div>
        </>
      )}
      
      {showDescription && campaign.description && (
        <div className="profile-faded">
          {campaign.description.length > 100 
            ? `${campaign.description.substring(0, 100)}...` 
            : campaign.description}
        </div>
      )}
      
      {showEndDate && campaign.end_datetime && (
        <div className={`profile-faded ${isEnded ? 'campaign-ended' : ''}`}>
          {isEnded ? '🕒 پایان یافته' : `🕒 پایان: ${formatDate(campaign.end_datetime)}`}
        </div>
      )}
    </div>
  );
};

export default CampaignListItem; 