import React from 'react';
import { FaEdit, FaEye, FaClock, FaCheckCircle, FaTimesCircle, FaVoteYea } from 'react-icons/fa';

interface UserCreatedPollItemProps {
  poll: {
    id: number;
    title: string;
    question: string;
    status: string;
    created_at: string;
    deadline: string;
    total_votes: number;
    is_multiple_choice: boolean;
    max_choices: number;
  };
  onClick: () => void;
}

export default function UserCreatedPollItem({ poll, onClick }: UserCreatedPollItemProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle style={{ color: '#28a745', marginLeft: 4 }} />;
      case 'rejected':
        return <FaTimesCircle style={{ color: '#dc3545', marginLeft: 4 }} />;
      case 'pending':
        return <FaClock style={{ color: '#ffc107', marginLeft: 4 }} />;
      case 'closed':
        return <FaTimesCircle style={{ color: '#6c757d', marginLeft: 4 }} />;
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
      case 'closed':
        return 'بسته شده';
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
    <div className="user-created-poll-item" onClick={onClick}>
      <div className="poll-header">
        <h3 className="poll-title">{poll.title}</h3>
        <div className="poll-status">
          {getStatusIcon(poll.status)}
          <span className={`status-text status-${poll.status}`}>
            {getStatusText(poll.status)}
          </span>
        </div>
      </div>
      
      <div className="poll-question">
        <p>{poll.question}</p>
      </div>
      
      <div className="poll-meta">
        <div className="meta-item">
          <FaClock style={{ marginLeft: 4, color: '#666' }} />
          <span>ایجاد شده: {formatDate(poll.created_at)}</span>
        </div>
        <div className="meta-item">
          <FaEdit style={{ marginLeft: 4, color: '#666' }} />
          <span>تاریخ پایان: {formatDate(poll.deadline)}</span>
        </div>
        <div className="meta-item">
          <FaVoteYea style={{ marginLeft: 4, color: '#666' }} />
          <span>{poll.total_votes} رای</span>
        </div>
        <div className="meta-item">
          <FaEye style={{ marginLeft: 4, color: '#666' }} />
          <span>{poll.is_multiple_choice ? `${poll.max_choices} گزینه` : 'تک‌انتخابی'}</span>
        </div>
      </div>
    </div>
  );
} 