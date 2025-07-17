import React, { useState, useEffect } from 'react';
import { useAuthApi } from '../api/auth';
import { useColorMode } from '@docusaurus/theme-common';
import SenfiAccordion from './SenfiAccordion';

interface Signature {
  id: number;
  user_email: string;
  is_anonymous: string; // 'public' | 'anonymous'
  signed_at: string;
}

interface CampaignSignaturesProps {
  campaignId: number;
}

export default function CampaignSignatures({ campaignId }: CampaignSignaturesProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authApi = useAuthApi();

  useEffect(() => {
    const fetchSignatures = async () => {
      try {
        setLoading(true);
        const data = await authApi.getCampaignSignatures(campaignId);
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
      <SenfiAccordion
        title={`امضاهای ثبت شده (${signatures.length})`}
        defaultOpen={false}
        icon={null}
      >
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {signatures.map((signature) => (
            <div
              key={signature.id}
              style={{
                padding: '0.75rem',
                marginBottom: '0.5rem',
                background: isDark ? 'rgba(30,34,54,0.95)' : 'rgba(255,255,255,0.8)',
                borderRadius: '0.5rem',
                border: isDark ? '1px solid #637eda' : '1px solid var(--ifm-color-primary-lightest)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--ifm-color-primary-dark)' }}>
                  {signature.is_anonymous === 'anonymous' ? 'کاربر ناشناس' : signature.user_email}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                  {signature.signed_at ? new Date(signature.signed_at).toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
              {signature.is_anonymous === 'anonymous' && (
                <span style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
                  ناشناس
                </span>
              )}
            </div>
          ))}
        </div>
      </SenfiAccordion>
    </div>
  );
} 