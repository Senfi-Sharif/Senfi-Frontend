import React from 'react';
import ReactDOM from 'react-dom';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title = 'تایید عملیات',
  message,
  confirmText = 'تایید',
  cancelText = 'انصراف',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!open) return null;

  const modal = (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-content">
        <div className="confirm-modal-header">{title}</div>
        <div className="confirm-modal-body">{message}</div>
        <div className="confirm-modal-actions">
          <button
            className="confirm-modal-cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className="confirm-modal-confirm-btn"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof window !== 'undefined') {
    return ReactDOM.createPortal(modal, document.body);
  }
  return modal;
};

export default ConfirmModal; 