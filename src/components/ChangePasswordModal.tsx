import React, { useState } from 'react';
import Modal from './Modal';
import { useAuthApi } from '../api/auth';
import { SecureTokenManager } from '../utils/security';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ open, onClose, onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const authApi = useAuthApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validation
    if (!currentPassword.trim()) {
      setError('رمز عبور فعلی الزامی است');
      return;
    }
    
    if (!newPassword.trim()) {
      setError('رمز عبور جدید الزامی است');
      return;
    }
    
    if (!confirmPassword.trim()) {
      setError('تکرار رمز عبور جدید الزامی است');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('رمز عبور جدید و تکرار آن یکسان نیستند');
      return;
    }
    
    // Check if new password is different from current
    if (currentPassword === newPassword) {
      setError('رمز عبور جدید باید متفاوت از رمز عبور فعلی باشد');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await authApi.changePassword(currentPassword, newPassword, confirmPassword);
      
      if (result.success) {
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Close modal
        onClose();
        
        // Clear all authentication data
        SecureTokenManager.clearAuth();
        
        // Show success message and redirect to login
        if (onSuccess) {
          onSuccess();
        }
        
        // Force logout since password changed
        window.location.href = '/';
      } else {
        setError(result.detail || 'خطا در تغییر رمز عبور');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <h2 className="auth-modal-title">تغییر رمز عبور</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-form-label">رمز عبور فعلی:</label>
        <input 
          type="password" 
          value={currentPassword} 
          onChange={(e) => setCurrentPassword(e.target.value)} 
          placeholder="رمز عبور فعلی" 
          className="auth-form-input"
          dir="ltr"
          disabled={loading} 
        />
        
        <label className="auth-form-label">رمز عبور جدید:</label>
        <input 
          type="password" 
          value={newPassword} 
          onChange={(e) => setNewPassword(e.target.value)} 
          placeholder="رمز عبور جدید" 
          className="auth-form-input"
          dir="ltr"
          disabled={loading} 
        />
        
        <label className="auth-form-label">تکرار رمز عبور جدید:</label>
        <input 
          type="password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          placeholder="تکرار رمز عبور جدید" 
          className="auth-form-input"
          dir="ltr"
          disabled={loading} 
        />
        
        {error && <div className="auth-form-error">{error}</div>}
        
        <button type="submit" className="auth-form-button" disabled={loading}>
          {loading ? '...' : 'تغییر رمز عبور'}
        </button>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal; 