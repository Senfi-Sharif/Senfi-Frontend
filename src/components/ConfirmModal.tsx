import React from 'react';

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

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>{title}</div>
        <div style={styles.body}>{message}</div>
        <div style={styles.actions}>
          <button
            style={{ ...styles.button, ...styles.cancel }}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            style={{ ...styles.button, ...styles.confirm, ...(loading ? styles.disabled : {}) }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.35)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(2px)',
  },
  modal: {
    background: '#fff',
    borderRadius: '1rem',
    boxShadow: '0 8px 32px rgba(22,51,124,0.18)',
    minWidth: 320,
    maxWidth: 400,
    padding: '2rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'fadeIn 0.2s',
  },
  header: {
    fontWeight: 700,
    fontSize: '1.2rem',
    color: 'var(--ifm-color-primary-dark)',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  body: {
    fontSize: '1rem',
    color: '#333',
    marginBottom: '1.5rem',
    textAlign: 'center',
    lineHeight: 1.7,
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    width: '100%',
    justifyContent: 'center',
  },
  button: {
    padding: '0.6rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  confirm: {
    background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.15)',
  },
  cancel: {
    background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(244, 67, 54, 0.15)',
  },
  disabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
};

export default ConfirmModal; 