import React from 'react';
import { FaEdit, FaEye, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface UserCreatedCampaignItemProps {
  campaign: {
    id: number;
    title: string;
    status: string;
    created_at: string;
    deadline: string;
    signature_count: number;
  };
  onClick: () => void;
}

export default function UserCreatedCampaignItem({ campaign, onClick }: UserCreatedCampaignItemProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle style={{ color: '#28a745', marginLeft: 4 }} />;
      case 'rejected':
        return <FaTimesCircle style={{ color: '#dc3545', marginLeft: 4 }} />;
      case 'pending':
        return <FaClock style={{ color: '#ffc107', marginLeft: 4 }} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'تایید شده';
      case 'rejected':
        return 'رد شده';
      case 'pending':
        return 'در انتظار تایید';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="user-created-campaign-item" onClick={onClick}>
      <div className="campaign-header">
        <h3 className="campaign-title">{campaign.title}</h3>
        <div className="campaign-status">
          {getStatusIcon(campaign.status)}
          <span className={`status-text status-${campaign.status}`}>
            {getStatusText(campaign.status)}
          </span>
        </div>
      </div>
      
      <div className="campaign-meta">
        <div className="meta-item">
          <FaClock style={{ marginLeft: 4, color: '#666' }} />
          <span>ایجاد شده: {formatDate(campaign.created_at)}</span>
        </div>
        <div className="meta-item">
          <FaEdit style={{ marginLeft: 4, color: '#666' }} />
          <span>تاریخ پایان: {formatDate(campaign.deadline)}</span>
        </div>
        <div className="meta-item">
          <FaEye style={{ marginLeft: 4, color: '#666' }} />
          <span>{campaign.signature_count} امضا</span>
        </div>
      </div>
    </div>
  );
} 