import React, { useState, useEffect } from 'react';
import { useAuthApi } from '../api/auth';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';
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
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const authApi = useAuthApi();

  useEffect(() => {
    const fetchSignatures = async () => {
      try {
        setLoading(true);
        const data = await authApi.getCampaignSignatures(campaignId);
        setSignatures(data.signatures || []);
        setData(data);
        setError(null);
      } catch (err) {
        setError('خطا در بارگذاری امضاها');
        setSignatures([]);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSignatures();
  }, [campaignId]);

  if (loading) {
    return (
      <LoadingSpinner message="در حال بارگذاری امضاها..." />
    );
  }

  if (error) {
    return (
      <ErrorMessage message={error} />
    );
  }

  // اگر کارزار ناشناس است، فقط تعداد را نمایش بده
  if (data && data.campaign_is_anonymous === 'anonymous') {
    return (
      <EmptyState 
        icon="📝"
        title={data.total === 0 ? 'هنوز امضایی ثبت نشده است' : `${data.total} امضا ثبت شده است`}
        subtitle="این کارزار به صورت ناشناس اداره می‌شود"
      />
    );
  }

  // اگر کارزار عمومی است و هیچ امضایی ثبت نشده
  if (data && data.campaign_is_anonymous === 'public' && signatures.length === 0) {
    return (
      <EmptyState 
        icon="📝"
        title="هنوز امضایی ثبت نشده است"
        subtitle="اولین نفری باشید که این کارزار را امضا می‌کند"
      />
    );
  }

  const totalSignatures = (data && typeof data.total === 'number') ? data.total : signatures.length;
  return (
    <div className="campaign-signatures-list">
      <SenfiAccordion
        title={`امضاهای ثبت شده (${totalSignatures})`}
        defaultOpen={false}
        icon={null}
      >
        <div className="campaign-signatures-scroll">
          {data && data.campaign_anonymous_allowed === true ? (
            <div style={{ padding: '1.2em', textAlign: 'center', color: '#888', fontSize: '1.05em' }}>
              اسامی امضاکنندگان این کارزار ناشناس است
            </div>
          ) : (
            signatures.map((signature) => (
              <div
                key={signature.id}
                className="campaign-signature-item"
              >
                <div>
                  <div className="campaign-signature-email">
                    {signature.is_anonymous === 'anonymous' ? 'کاربر ناشناس' : signature.user_email}
                  </div>
                  <div className="campaign-signature-date">
                    {signature.signed_at ? new Date(signature.signed_at).toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
                {signature.is_anonymous === 'anonymous' && (
                  <span className="campaign-signature-anonymous">
                    ناشناس
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </SenfiAccordion>
    </div>
  );
} 