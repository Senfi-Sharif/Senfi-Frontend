import React, { useState, useEffect } from 'react';
import { getCampaignSignatures } from '@site/src/api/auth';

interface Signature {
  id: number;
  user_email: string;
  is_anonymous: boolean;
  created_at: string;
}

interface CampaignSignaturesProps {
  campaignId: number;
}

export default function CampaignSignatures({ campaignId }: CampaignSignaturesProps) {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignatures = async () => {
      try {
        setLoading(true);
        const data = await getCampaignSignatures(campaignId);
        setSignatures(data.signatures || []);
        setError(null);
      } catch (err) {
        setError('خطا در بارگذاری امضاها');
        setSignatures([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSignatures();
  }, [campaignId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--ifm-color-primary)' }}>در حال بارگذاری...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <div style={{ fontSize: '1rem', color: '#d32f2f' }}>{error}</div>
      </div>
    );
  }

  if (signatures.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <div style={{ fontSize: '1rem', color: '#666' }}>هنوز امضایی ثبت نشده است</div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <h4 style={{ marginBottom: '1rem', color: 'var(--ifm-color-primary-dark)' }}>
        امضاهای ثبت شده ({signatures.length})
      </h4>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {signatures.map((signature) => (
          <div
            key={signature.id}
            style={{
              padding: '0.75rem',
              marginBottom: '0.5rem',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '0.5rem',
              border: '1px solid var(--ifm-color-primary-lightest)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: 'var(--ifm-color-primary-dark)' }}>
                {signature.is_anonymous ? 'کاربر ناشناس' : signature.user_email}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                {new Date(signature.created_at).toLocaleDateString('fa-IR')}
              </div>
            </div>
            {signature.is_anonymous && (
              <span style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
                ناشناس
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 