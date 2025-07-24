import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import BlogSidebar from '../components/BlogSidebar';
import { FaPlus } from 'react-icons/fa';
import { SecureTokenManager } from '../utils/security';
import CampaignSignatures from '../components/CampaignSignatures';
import { useAuthApi } from '../api/auth';
import moment from 'moment-jalaali';
import GenericListPage from '../components/GenericListPage';
import GeneralSidebar from '../components/GeneralSidebar';

export default function CampaignsEnhanced(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const API_BASE = siteConfig.customFields.apiUrl;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortType, setSortType] = useState('created_at');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 3;

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [userFaculty, setUserFaculty] = useState('');
  const [userDormitory, setUserDormitory] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = SecureTokenManager.getToken();
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserFaculty(localStorage.getItem('faculty') || '');
      setUserDormitory(localStorage.getItem('dormitory') || '');
      setUserRole(SecureTokenManager.getRole() || '');
    }
  }, []);

  const authApi = useAuthApi();

  useEffect(() => {
    setLoading(true);
    authApi.getApprovedCampaigns()
      .then(data => {
        const list = data.campaigns || [];
        setCampaigns(list);
        const catMap: Record<string, number> = {};
        list.forEach((c: any) => {
          if (c.category) {
            catMap[c.category] = (catMap[c.category] || 0) + 1;
          }
        });
        setCategories(Object.keys(catMap));
        setCategoryCounts(catMap);
        setLoading(false);
        setError('');
      })
      .catch(err => {
        setError('خطا در دریافت لیست کارزارها');
        setLoading(false);
      });
  }, []);

  // Prepare category options
  const categoryOptions = useMemo(() => categories, [categories]);
  useEffect(() => {
    if (selectedCategories.length === 0 && categoryOptions.length > 0) {
      setSelectedCategories(categoryOptions);
    }
  }, [categoryOptions]);

  // Filter, search, sort
  const filteredCampaigns = useMemo(() => {
    let result = campaigns;
    if (selectedCategories.length > 0 && selectedCategories.length < categoryOptions.length) {
      result = result.filter((c: any) => selectedCategories.includes(c.category));
    }
    if (searchQuery.trim()) {
      const s = searchQuery.trim().toLowerCase();
      result = result.filter((c: any) =>
        (c.title && c.title.toLowerCase().includes(s)) ||
        (c.excerpt && c.excerpt.toLowerCase().includes(s))
  );
}
    let sorted = [...result];
    if (sortType === 'signature_count') {
      sorted.sort((a, b) => (b.signature_count || 0) - (a.signature_count || 0));
    } else if (sortType === 'deadline') {
      sorted.sort((a, b) => {
        const aTime = a.deadline ? new Date(a.deadline).getTime() : 0;
        const bTime = b.deadline ? new Date(b.deadline).getTime() : 0;
        return aTime - bTime;
      });
    } else if (sortType === 'created_at') {
      sorted.sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      });
    }
    return sorted;
  }, [campaigns, selectedCategories, searchQuery, sortType, categoryOptions]);

  // Pagination
  const totalPages = Math.ceil(filteredCampaigns.length / postsPerPage);
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredCampaigns.slice(startIndex, startIndex + postsPerPage);
  }, [filteredCampaigns, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategories, sortType]);

  // Sidebar
  const sidebar = (
    <BlogSidebar
      recentPosts={paginatedCampaigns.slice(0, 3).map(c => ({
        ...c,
        id: c.id,
        url: `/campaign-detail?id=${c.id}`
      }))}
      categories={categories.map(cat => ({ name: cat, count: categoryCounts[cat] || 0 }))}
      onCategoryClick={cat => setSelectedCategories([cat])}
      selectedCategory={selectedCategories[0] || ''}
      statsTitle="آمار کارزارها"
    />
  );

  // Sort options
  const sortOptions = [
    { key: 'created_at', label: 'جدیدترین' },
    { key: 'signature_count', label: 'بیشترین امضا' },
    { key: 'deadline', label: 'نزدیک‌ترین ددلاین' },
  ];

  // Create button
  const createButton = isAuthenticated ? (
    <button
      className="blog-enhanced-create-btn"
      onClick={() => window.location.href = '/campaign-create'}
      title="ایجاد کارزار جدید"
    >
      <FaPlus className="blog-enhanced-create-icon" />
      ایجاد کارزار جدید
    </button>
  ) : null;

  // Render item
  const renderItem = (c: any) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  const toPersianDigits = (str: string) =>
    str.replace(/[0-9]/g, d => String.fromCharCode(d.charCodeAt(0) + 1728));
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const m = moment(dateString);
    const formatted = m.format('jYYYY/jMM/jDD [ساعت] HH:mm');
    return toPersianDigits(formatted);
  };
  const isCampaignExpired = (deadline: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };
  return (
                      <article key={c.id} className="blog-enhanced-post">
                        <header className="blog-enhanced-post-header">
                        {isCampaignExpired(c.deadline) && (
                            <div style={{
                              background: '#cfa7a7',
                              color: '#a11d1d',
                              textAlign: 'center',
                              fontWeight: 500,
                              fontSize: '1.15em',
                              padding: '12px 0',
                              borderRadius: '40px 40px 40px 40px',
                            }}>
                              این کارزار به پایان رسیده است
                            </div>
                        )}
                          <h2 className="blog-enhanced-post-title">
                            <a href={`/campaign-detail?id=${c.id}`} className="blog-enhanced-post-link">
                              {c.title}
                            </a>
                          </h2>
                          {c.author_faculty && c.author_faculty !== 'نامشخص' && (
                            <span style={{ marginLeft: 12, fontSize: 14, color: '#555' }}>دانشکده: <b>{c.author_faculty}</b></span>
                          )}
                          {c.author_dormitory && c.author_dormitory !== 'خوابگاهی نیستم' && (
                            <span style={{ fontSize: 14, color: '#555' }}>خوابگاه: <b>{c.author_dormitory}</b></span>
                          )}
                          <span className="blog-enhanced-post-category" style={{ marginRight: 8, fontWeight: 500, color: '#1e40af', display: 'inline-block' }}>
                            {c.category}
                          </span>
                          <div className="blog-enhanced-post-meta">
            <span className="blog-enhanced-post-date">{formatDate(c.created_at)}</span>
                            <span className="blog-enhanced-post-deadline" style={{ marginRight: 12, color: '#dc2626', fontWeight: 500 }}>
                              ددلاین: {formatDateTime(c.deadline)}
                            </span>
            <span className="blog-enhanced-post-author">{c.author_email}</span>
                          </div>
                          <div className="blog-enhanced-post-tags">
                            {Array.isArray(c.tags) ? c.tags.map((tag: string) => (
              <span key={tag} className="blog-enhanced-post-tag">{tag}</span>
                            )) : null}
                          </div>
                        </header>
                        {c.image_url && (
                          <div className="blog-enhanced-post-image">
                            <img
                              src={c.image_url}
                              alt={c.title}
                              className="post-image"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            />
                          </div>
                        )}
        <div className="blog-enhanced-post-excerpt">{c.excerpt}</div>
                        {c.has_signed && (
                          <div className="sign-campaign-success" style={{ margin: '1rem 0 0.5rem 0', color: '#16a34a', background: '#e6fbe8', borderRadius: 8, padding: '0.7em 1em', display: 'flex', alignItems: 'center', fontWeight: 500, fontSize: '1.08em' }}>
                            <svg style={{ marginLeft: 8 }} width="20" height="20" fill="#16a34a" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 6.293a1 1 0 010 1.414l-6.364 6.364a1 1 0 01-1.414 0l-3.182-3.182a1 1 0 111.414-1.414l2.475 2.475 5.657-5.657a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            شما این کارزار را امضا کرده‌اید
                          </div>
                        )}
                        <div style={{ margin: '1.2rem 0 0.5rem 0' }}>
                          <CampaignSignatures campaignId={c.id} />
                        </div>
                        <footer className="blog-enhanced-post-footer">
          <a href={`/campaign-detail?id=${c.id}`} className="blog-enhanced-read-more">مشاهده جزئیات</a>
                        </footer>
                      </article>
    );
  };

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
        <GeneralSidebar current="campaigns" />
        <div style={{ flex: 1 }}>
      <GenericListPage
        title="کارزارها"
        description="لیست کارزارهای فعال و گذشته شورای صنفی دانشجویان دانشگاه صنعتی شریف"
        items={paginatedCampaigns}
        loading={loading}
        error={error || ''}
        searchPlaceholder="جستجو در کارزارها..."
        onSearch={setSearchQuery}
        filterOptions={categoryOptions}
        filterLabel="دسته‌بندی"
        filterValue={selectedCategories}
        onFilterChange={setSelectedCategories}
        sortOptions={sortOptions}
        sortValue={sortType}
        onSortChange={setSortType}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
        renderItem={renderItem}
        sidebar={sidebar}
        onClearFilters={() => {
          setSearchQuery('');
          setSelectedCategories(categoryOptions);
        }}
        createButton={createButton}
              />
        </div>
      </div>
    </Layout>
  );
} 
 