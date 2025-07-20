import React, { useState, useEffect, useRef } from 'react';
import { useAuthApi } from '../api/auth';
import { FaUser, FaEnvelope, FaUserShield } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface User {
  id: number;
  email: string;
  role: string;
  unit?: string;
}

interface AdminUserListProps {
  title?: string;
  onUserClick?: (user: User) => void;
  className?: string;
  showRole?: boolean;
  showUnit?: boolean;
}

const AdminUserList: React.FC<AdminUserListProps> = ({
  title = 'لیست کاربران ثبت‌نامی',
  onUserClick,
  className = '',
  showRole = true,
  showUnit = true
}) => {
  const authApi = useAuthApi();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isMounted = useRef(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const users = await authApi.getUsers();
        if (isMounted.current) {
          setUsers(users);
          setError('');
        }
      } catch (err) {
        if (isMounted.current) {
          setError('خطا در دریافت لیست کاربران');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    }
    fetchUsers();
    
    return () => {
      isMounted.current = false;
    };
  }, []); // Remove authApi from dependencies to prevent infinite loop

  const handleUserClick = (user: User) => {
    if (onUserClick) {
      onUserClick(user);
    } else {
      // Default behavior - navigate to user profile
      window.location.href = `/profile-user?id=${user.id}`;
    }
  };

  return (
    <div className={`profile-card ${className}`}>
      <h2 className="profile-admin-title">
        <FaUserShield style={{marginLeft:8}}/>{title}
      </h2>
      {loading ? (
        <LoadingSpinner message="در حال بارگذاری لیست کاربران..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="profile-users-list">
          {users.map((user) => (
            <div 
              key={user.id} 
              className="profile-user-item" 
              onClick={() => handleUserClick(user)}
              tabIndex={0} 
              role="button" 
              aria-label={`نمایش پروفایل ${user.email}`}
            >
              <span className="profile-user-email">
                <FaEnvelope style={{marginLeft:4}}/>{user.email}
              </span>
              {showRole && (
                <span className="profile-user-role">
                  <FaUser style={{marginLeft:4}}/>{user.role}
                  {showUnit && user.unit ? ` | ${user.unit}` : ''}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUserList; 