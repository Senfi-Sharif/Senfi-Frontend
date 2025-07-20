import React from 'react';
import { FaUser, FaEnvelope, FaUserShield, FaSign } from 'react-icons/fa';

interface UserInfoCardProps {
  user: {
    email: string;
    role: string;
    unit?: string;
    faculty?: string;
    dormitory?: string;
  };
  showActions?: boolean;
  onLogout?: () => void;
  onRoleChange?: (role: string) => void;
  className?: string;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({
  user,
  showActions = true,
  onLogout,
  onRoleChange,
  className = ''
}) => {
  return (
    <div className={`profile-info-card ${className}`}>
      <h2 className="profile-info-title">
        <FaUser style={{marginLeft:8}}/>اطلاعات شخصی
      </h2>
      <div className="profile-info-item">
        <FaEnvelope style={{marginLeft:4}}/>
        <strong>ایمیل:</strong> {user.email}
      </div>
      <div className="profile-info-item">
        <FaUserShield style={{marginLeft:4}}/>
        <strong>نقش:</strong> {user.role}
      </div>
      {user.unit && (
        <div className="profile-info-item">
          <strong>واحد:</strong> {user.unit}
        </div>
      )}
      {user.faculty && (
        <div className="profile-info-item">
          <strong>دانشکده:</strong> {user.faculty}
        </div>
      )}
      {user.dormitory && (
        <div className="profile-info-item">
          <strong>خوابگاه:</strong> {user.dormitory}
        </div>
      )}
      {showActions && onLogout && (
        <button 
          onClick={onLogout}
          className="profile-logout-button"
        >
          <FaSign style={{marginLeft:4}}/>خروج از حساب
        </button>
      )}
    </div>
  );
};

export default UserInfoCard; 