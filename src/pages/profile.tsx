import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useAuthApi } from '../api/auth';
import { FaUser, FaCheckCircle, FaVoteYea, FaEdit, FaNewspaper, FaPoll } from 'react-icons/fa';
import { SecureTokenManager } from '../utils/security';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import UserInfoCard from '../components/UserInfoCard';
import CampaignListItem from '../components/CampaignListItem';
import VotedPollListItem from '../components/VotedPollListItem';
import UserCreatedCampaignItem from '../components/UserCreatedCampaignItem';
import UserCreatedBlogItem from '../components/UserCreatedBlogItem';
import UserCreatedPollItem from '../components/UserCreatedPollItem';
import AdminUserList from '../components/AdminUserList';
import ChangePasswordModal from '../components/ChangePasswordModal';



function ProfileContent({ 
  signedCampaigns, 
  votedPolls, 
  userCreatedCampaigns, 
  userCreatedBlogPosts, 
  userCreatedPolls,
  userEmail, 
  userRole, 
  error, 
  handleLogout, 
  onChangePassword 
}) {
  return (
    <div className="profile-main-content">
      <h1 className="profile-main-title"><FaUser style={{marginLeft:8}}/>پروفایل کاربر</h1>
      {/* فقط برای سوپرادمین و head */}
      {(userRole === 'superadmin' || userRole === 'head') && <AdminUserList />}
      {/* اطلاعات کاربر */}
      <UserInfoCard 
        user={{ email: userEmail, role: userRole }}
        onLogout={handleLogout}
        onChangePassword={onChangePassword}
      />
      {/* کارزارهای امضاشده */}
      <div className="profile-signed-campaigns-card">
        <h2 className="profile-campaigns-title"><FaCheckCircle style={{marginLeft:8}}/>کارزارهای امضاشده <span style={{fontWeight:400}}>({signedCampaigns.length} کارزار)</span></h2>
        {error && (
          <ErrorMessage message={error} />
        )}
        {signedCampaigns.length === 0 ? (
          <EmptyState 
            icon="📋"
            title="هنوز هیچ کارزاری امضا نکرده‌اید"
            subtitle="پس از امضای کارزارها، آن‌ها در اینجا نمایش داده خواهند شد"
          />
        ) : (
          <div className="profile-campaigns-list">
            {signedCampaigns.map((campaign: any) => (
              <CampaignListItem
                key={campaign.campaign_id}
                campaign={{
                  id: campaign.campaign_id,
                  title: campaign.campaign_title,
                  signed_at: campaign.signed_at,
                  is_anonymous: campaign.is_anonymous
                }}
                onClick={() => window.location.href = `/campaign-detail?id=${campaign.campaign_id}`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* نظرسنجی‌های امضا شده */}
      <div className="profile-signed-campaigns-card">
        <h2 className="profile-campaigns-title"><FaVoteYea style={{marginLeft:8}}/>نظرسنجی‌های امضا شده <span style={{fontWeight:400}}>({votedPolls.length} نظرسنجی)</span></h2>
        {votedPolls.length === 0 ? (
          <EmptyState 
            icon="🗳️"
            title="هنوز در هیچ نظرسنجی‌ای شرکت نکرده‌اید"
            subtitle="پس از شرکت در نظرسنجی‌ها، آن‌ها در اینجا نمایش داده خواهند شد"
          />
        ) : (
          <div className="profile-polls-list">
            {votedPolls.map((poll: any) => (
              <VotedPollListItem
                key={poll.id}
                poll={poll}
              />
            ))}
          </div>
        )}
      </div>

      {/* کارزارهای ایجاد شده */}
      {/* <div className="profile-signed-campaigns-card">
        <h2 className="profile-campaigns-title"><FaEdit style={{marginLeft:8}}/>کارزارهای من <span style={{fontWeight:400}}>({userCreatedCampaigns.length} کارزار)</span></h2>
        {userCreatedCampaigns.length === 0 ? (
          <EmptyState 
            icon="📝"
            title="هنوز هیچ کارزاری ایجاد نکرده‌اید"
            subtitle="پس از ایجاد کارزارها، آن‌ها در اینجا نمایش داده خواهند شد"
          />
        ) : (
          <div className="profile-created-campaigns-list">
            {userCreatedCampaigns.map((campaign: any) => (
              <UserCreatedCampaignItem
                key={campaign.id}
                campaign={campaign}
                onClick={() => window.location.href = `/campaign-detail?id=${campaign.id}`}
              />
            ))}
          </div>
        )}
      </div> */}

      {/* بلاگ‌های ایجاد شده */}
      {/* <div className="profile-signed-campaigns-card">
        <h2 className="profile-campaigns-title"><FaNewspaper style={{marginLeft:8}}/>بلاگ‌های من <span style={{fontWeight:400}}>({userCreatedBlogPosts.length} بلاگ)</span></h2>
        {userCreatedBlogPosts.length === 0 ? (
          <EmptyState 
            icon="📰"
            title="هنوز هیچ بلاگی ایجاد نکرده‌اید"
            subtitle="پس از ایجاد بلاگ‌ها، آن‌ها در اینجا نمایش داده خواهند شد"
          />
        ) : (
          <div className="profile-created-blog-list">
            {userCreatedBlogPosts.map((blogPost: any) => (
              <UserCreatedBlogItem
                key={blogPost.id}
                blogPost={blogPost}
                onClick={() => window.location.href = `/blog-post?slug=${blogPost.slug}`}
              />
            ))}
          </div>
        )}
      </div> */}

      {/* نظرسنجی‌های ایجاد شده */}
      {/* <div className="profile-signed-campaigns-card">
        <h2 className="profile-campaigns-title"><FaPoll style={{marginLeft:8}}/>نظرسنجی‌های من <span style={{fontWeight:400}}>({userCreatedPolls.length} نظرسنجی)</span></h2>
        {userCreatedPolls.length === 0 ? (
          <EmptyState 
            icon="📊"
            title="هنوز هیچ نظرسنجی‌ای ایجاد نکرده‌اید"
            subtitle="پس از ایجاد نظرسنجی‌ها، آن‌ها در اینجا نمایش داده خواهند شد"
          />
        ) : (
          <div className="profile-created-polls-list">
            {userCreatedPolls.map((poll: any) => (
              <UserCreatedPollItem
                key={poll.id}
                poll={poll}
                onClick={() => window.location.href = `/poll-detail?id=${poll.id}`}
              />
            ))}
          </div>
        )}
      </div> */}
    </div>
  );
}

export default function Profile() {
  const [signedCampaigns, setSignedCampaigns] = useState([]);
  const [votedPolls, setVotedPolls] = useState([]);
  const [userCreatedCampaigns, setUserCreatedCampaigns] = useState([]);
  const [userCreatedBlogPosts, setUserCreatedBlogPosts] = useState([]);
  const [userCreatedPolls, setUserCreatedPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  const authApi = useAuthApi();

  useEffect(() => {
    // بررسی لاگین بودن کاربر
    if (typeof window !== 'undefined') {
      const email = SecureTokenManager.getEmail();
      const role = SecureTokenManager.getRole();
      if (!email) {
        setError('برای مشاهده پروفایل ابتدا وارد شوید');
        setLoading(false);
        return;
      }
      setUserEmail(email);
      setUserRole(role || 'کاربر');
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch all user data in parallel
        const [campaignsData, pollsData, createdCampaignsData, createdBlogPostsData, createdPollsData] = await Promise.all([
          authApi.getUserSignedCampaigns(),
          authApi.getUserVotedPolls(),
          authApi.getUserCreatedCampaigns(),
          authApi.getUserCreatedBlogPosts(),
          authApi.getUserCreatedPolls()
        ]);
        
        setSignedCampaigns(campaignsData.campaigns || []);
        setVotedPolls(pollsData.polls || []);
        setUserCreatedCampaigns(createdCampaignsData.campaigns || []);
        setUserCreatedBlogPosts(createdBlogPostsData.blog_posts || []);
        setUserCreatedPolls(createdPollsData.polls || []);
        setError(null);
      } catch (err) {
        setError('خطا در بارگذاری اطلاعات پروفایل');
        setSignedCampaigns([]);
        setVotedPolls([]);
        setUserCreatedCampaigns([]);
        setUserCreatedBlogPosts([]);
        setUserCreatedPolls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      SecureTokenManager.clearAuth();
      window.location.href = '/';
    }
  };

  const handleChangePassword = () => {
    setChangePasswordModalOpen(true);
  };

  const handleChangePasswordSuccess = () => {
    // Password changed successfully, user will be redirected to login
    // This function is called before the redirect
  };

  if (loading) {
    return (
      <Layout title="پروفایل کاربر">
        <LoadingSpinner message="در حال بارگذاری پروفایل..." />
      </Layout>
    );
  }

  if (error && !userEmail) {
    return (
      <Layout title="پروفایل کاربر">
        <div className="profile-error-container">
          <ErrorMessage message={error} />
          <a href="/" className="profile-return-link">بازگشت به صفحه اصلی</a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="پروفایل کاربر">
      <ProfileContent 
        signedCampaigns={signedCampaigns} 
        votedPolls={votedPolls}
        userCreatedCampaigns={userCreatedCampaigns}
        userCreatedBlogPosts={userCreatedBlogPosts}
        userCreatedPolls={userCreatedPolls}
        userEmail={userEmail} 
        userRole={userRole} 
        error={error} 
        handleLogout={handleLogout} 
        onChangePassword={handleChangePassword}
      />
      <ChangePasswordModal 
        open={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
        onSuccess={handleChangePasswordSuccess}
      />
    </Layout>
  );
} 