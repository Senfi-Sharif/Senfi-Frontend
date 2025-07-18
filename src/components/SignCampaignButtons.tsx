import React, { useState, useEffect } from 'react';
import { useAuthApi } from '../api/auth';
import { useNotification } from '../contexts/NotificationContext';
import { FaCheckCircle } from 'react-icons/fa';

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
      <div className="sign-campaign-success">
        <FaCheckCircle /> شما این کارزار را امضا کرده‌اید
      </div>
    );
  }

  return (
    <div className="sign-campaign-buttons-wrapper">
      {error && (
        <div className="sign-campaign-error">{error}</div>
      )}
      <div className="sign-campaign-buttons">
        {isAnonymous && (
          <button
            onClick={() => handleSign(true)}
            disabled={loading}
            className={`sign-campaign-button sign-campaign-anonymous${loading ? ' sign-campaign-disabled' : ''}`}
          >
            {loading ? 'در حال ثبت...' : 'امضای ناشناس'}
          </button>
        )}
        
        <button
          onClick={() => handleSign(false)}
          disabled={loading}
          className={`sign-campaign-button sign-campaign-public${loading ? ' sign-campaign-disabled' : ''}`}
        >
          {loading ? 'در حال ثبت...' : 'امضای عمومی'}
        </button>
      </div>
    </div>
  );
}