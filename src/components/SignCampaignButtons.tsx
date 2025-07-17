import React, { useState, useEffect } from 'react';
import { useAuthApi } from '../api/auth';
import { useNotification } from '@site/src/contexts/NotificationContext';

interface SignCampaignButtonsProps {
  campaignId: number;
  campaignIsAnonymous: string;
  onSignatureSuccess?: () => void;
}

export default function SignCampaignButtons({ 
  campaignId, 
  campaignIsAnonymous, 
  onSignatureSuccess 
}: SignCampaignButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const authApi = useAuthApi();

  const isAnonymous = campaignIsAnonymous === "anonymous";

  useEffect(() => {
    checkSignature();
  }, [campaignId]);

  const checkSignature = async () => {
    try {
      const result = await authApi.checkUserSignature(campaignId);
      setHasSigned(result.has_signed);
    } catch (err) {
      // Silent error - user might not be logged in
    }
  };

  const handleSign = async (isAnonymous: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authApi.signCampaign(campaignId, isAnonymous);
      
      if (result.success) {
        setHasSigned(true);
        if (onSignatureSuccess) {
          onSignatureSuccess();
        }
        showNotification('امضای شما با موفقیت ثبت شد!', 'success');
      } else {
        setError(result.message || 'خطا در ثبت امضا');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت امضا');
    } finally {
      setLoading(false);
    }
  };

  if (hasSigned) {
    return (
      <div style={{
        padding: '1rem',
        background: 'rgba(76, 175, 80, 0.1)',
        borderRadius: '0.5rem',
        border: '1px solid #4caf50',
        textAlign: 'center',
        color: '#2e7d32',
        fontWeight: 600
      }}>
        ✅ شما این کارزار را امضا کرده‌اید
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      {error && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          background: 'rgba(244, 67, 54, 0.1)',
          borderRadius: '0.5rem',
          border: '1px solid #f44336',
          color: '#d32f2f',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {isAnonymous && (
          <button
            onClick={() => handleSign(true)}
            disabled={loading}
            style={{
              ...styles.signButton,
              ...styles.anonymousButton,
              ...(loading && styles.disabledButton)
            }}
          >
            {loading ? 'در حال ثبت...' : 'امضای ناشناس'}
          </button>
        )}
        
        <button
          onClick={() => handleSign(false)}
          disabled={loading}
          style={{
            ...styles.signButton,
            ...styles.publicButton,
            ...(loading && styles.disabledButton)
          }}
        >
          {loading ? 'در حال ثبت...' : 'امضای عمومی'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  signButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '140px',
  },
  anonymousButton: {
    background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
  },
  publicButton: {
    background: 'linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-dark) 100%)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(22, 51, 124, 0.3)',
  },
  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none !important',
  },
}; 