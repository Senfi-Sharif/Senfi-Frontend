import React, { useEffect, useState, useMemo } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { FaPlus } from 'react-icons/fa';
import { SecureTokenManager } from '../utils/security';
import BlogSidebar from '../components/BlogSidebar';
import GenericListPage from '../components/GenericListPage';
import GeneralSidebar from '../components/GeneralSidebar';

import { sanitizeHTML } from '../utils/security';

export default function PollsPage() {
  const { siteConfig } = useDocusaurusContext();
  const API_BASE = siteConfig.customFields.apiUrl;
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState('created_at');
  const [showOpen, setShowOpen] = useState(true);
  const [showClosed, setShowClosed] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  useEffect(() => {
    setIsAuthenticated(!!SecureTokenManager.getToken());
  }, []);

  useEffect(() => {
    setLoading(true);
    const token = SecureTokenManager.getToken();
    fetch(`${API_BASE}/api/polls`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setPolls(data.polls || []);
        setLoading(false);
        setError('');
      })
      .catch(() => {
        setError('خطا در دریافت لیست نظرسنجی‌ها');
        setLoading(false);
      });
  }, [API_BASE]);

  // Extract categories from polls
  const categoryOptions = useMemo(() => {
    const catMap: Record<string, number> = {};
    polls.forEach((p: any) => {
      if (p.category) catMap[p.category] = (catMap[p.category] || 0) + 1;
    });
    return Object.keys(catMap);
  }, [polls]);
  useEffect(() => {
    if (selectedCategories.length === 0 && categoryOptions.length > 0) {
      setSelectedCategories(categoryOptions);
    }
  }, [categoryOptions]);

  // Filter, search, sort
  const filteredPolls = useMemo(() => {
    let result = polls;
    if (selectedCategories.length > 0 && selectedCategories.length < categoryOptions.length) {
      result = result.filter((p: any) => selectedCategories.includes(p.category));
    }
    if (!showOpen || !showClosed) {
      const now = new Date();
      result = result.filter((p: any) => {
        const isClosed = p.deadline && new Date(p.deadline) < now;
        if (showClosed && isClosed) return true;
        if (showOpen && !isClosed) return true;
        return false;
      });
    }
    if (searchQuery.trim()) {
      const s = searchQuery.trim().toLowerCase();
      result = result.filter((p: any) =>
        (p.title && p.title.toLowerCase().includes(s)) ||
        (p.description && p.description.toLowerCase().includes(s))
      );
    }
    let sorted = [...result];
    if (sortType === 'total_votes') {
      sorted.sort((a, b) => (b.total_votes || 0) - (a.total_votes || 0));
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
  }, [polls, selectedCategories, searchQuery, sortType, showOpen, showClosed, categoryOptions]);

  // Pagination
  const totalPages = Math.ceil(filteredPolls.length / postsPerPage);
  const paginatedPolls = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredPolls.slice(startIndex, startIndex + postsPerPage);
  }, [filteredPolls, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategories, sortType, showOpen, showClosed]);

  // Sidebar
  const sidebar = (
    <BlogSidebar
      recentPosts={paginatedPolls.slice(0, 3).map(p => ({
    ...p,
    id: p.id,
    url: `/poll-detail?id=${p.id}`
      }))}
      categories={categoryOptions.map(cat => ({ name: cat, count: polls.filter(p => p.category === cat).length }))}
      onCategoryClick={cat => setSelectedCategories([cat])}
      selectedCategory={selectedCategories[0] || ''}
      statsTitle="آمار نظرسنجی‌ها"
    />
  );

  // Sort options
  const sortOptions = [
    { key: 'created_at', label: 'جدیدترین' },
    { key: 'deadline', label: 'نزدیک‌ترین ددلاین' },
    { key: 'total_votes', label: 'بیشترین رأی' },
  ];

  // Create button
  const createButton = isAuthenticated ? (
              <button
      className="blog-enhanced-create-btn"
                onClick={() => window.location.href = '/poll-create'}
                title="ایجاد نظرسنجی جدید"
              >
      <FaPlus className="blog-enhanced-create-icon" />
      ایجاد نظرسنجی جدید
              </button>
  ) : null;

  // Render item
  const renderItem = (poll: any) => {
                const isExpired = poll.deadline && new Date(poll.deadline) < new Date();
                const hasVoted = poll.has_voted;
                return (
      <article key={poll.id} className="blog-enhanced-post">
                    {isExpired && (
          <div style={{ background: '#cfa7a7', color: '#a11d1d', textAlign: 'center', fontWeight: 500, fontSize: '1.15em', padding: '12px 0', borderRadius: '40px 40px 40px 40px' }}>
                        این نظرسنجی به پایان رسیده است
                      </div>
                    )}
                    {hasVoted && (
          <div className="sign-campaign-success" style={{ margin: '1rem 0 0.5rem 0', color: '#16a34a', background: '#e6fbe8', borderRadius: 8, padding: '0.7em 1em', display: 'flex', alignItems: 'center', fontWeight: 500, fontSize: '1.08em' }}>
                        شما در این نظرسنجی شرکت کرده‌اید
                      </div>
                    )}
        <h2 className="blog-enhanced-post-title">
          <a href={`/poll-detail?id=${poll.id}`} className="blog-enhanced-post-link">
                      {poll.title}
          </a>
                    </h2>
        <div className="blog-enhanced-post-meta">
                        <span>دسته‌بندی: <b style={{ color: '#1976d2' }}>{poll.category}</b></span>
                        <span>تعداد گزینه‌ها: <b style={{ color: '#16a34a' }}>{poll.options ? poll.options.length : '-'}</b></span>
                        <span>نوع رأی: <b style={{ color: '#dc2626' }}>{poll.is_multiple_choice ? 'چندگزینه‌ای' : 'تکی'}</b></span>
                      {poll.is_multiple_choice && (
                          <span>حداکثر انتخاب مجاز: <b style={{ color: '#7c3aed' }}>{poll.max_choices ? (poll.max_choices === -1 ? 'نامحدود' : poll.max_choices) : 'نامحدود'}</b></span>
                      )}
                        <span>رأی: <b style={{ color: '#ea580c' }}>{poll.is_anonymous ? 'ناشناس' : 'شناس'}</b></span>
                      {typeof poll.total_votes !== 'undefined' && (
                          <span>تعداد کل رأی‌ها: <b style={{ color: '#059669' }}>{poll.total_votes}</b></span>
          )}
          <span>ددلاین: {new Date(poll.deadline).toLocaleString('fa-IR')}</span>
                        </div>
        <div className="blog-enhanced-post-excerpt">
          <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(poll.description) }} />
                    </div>
                    {poll.options && poll.total_votes > 0 && (
                      <div style={{ margin: '18px 0 10px 0' }}>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>نتایج فعلی:</div>
                        {poll.options.map((opt: any) => {
                          const percent = poll.total_votes > 0 ? Math.round((opt.votes_count / poll.total_votes) * 100) : 0;
                          return (
                            <div key={opt.id} style={{ marginBottom: 10 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 15 }}>
                                <span>{opt.text}</span>
                                <span style={{ fontWeight: 700 }}>{percent}%</span>
                              </div>
                              <div style={{ background: '#e0e7ef', borderRadius: 8, height: 14, marginTop: 4, overflow: 'hidden' }}>
                                <div style={{
                                  width: percent + '%',
                                  background: percent > 0 ? 'linear-gradient(90deg, #1976d2 60%, #16a34a 100%)' : '#e0e7ef',
                                  height: '100%',
                                  borderRadius: 8,
                                  transition: 'width 0.5s'
                                }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
        <footer className="blog-enhanced-post-footer">
          <a href={`/poll-detail?id=${poll.id}`} className="blog-enhanced-read-more">
                      {(isExpired || poll.has_voted) ? 'مشاهده' : 'مشاهده و رأی دادن'}
          </a>
        </footer>
      </article>
                );
  };

  return (
    <Layout title="نظرسنجی‌ها" description="لیست نظرسنجی‌های فعال و گذشته شورای صنفی دانشجویان دانشگاه صنعتی شریف">
      <div style={{ display: 'flex', flexDirection: 'row', minHeight: 'calc(100vh - 60px)' }}>
        <GeneralSidebar current="polls" />
        <div style={{ flex: 1 }}>
      <GenericListPage
        title="نظرسنجی‌ها"
        description="لیست نظرسنجی‌های فعال و گذشته شورای صنفی دانشجویان دانشگاه صنعتی شریف"
        items={paginatedPolls}
        loading={loading}
        error={error || ''}
        searchPlaceholder="جستجو در نظرسنجی‌ها..."
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
          setShowOpen(true);
          setShowClosed(true);
          setSortType('created_at');
        }}
        createButton={createButton}
          />
        </div>
      </div>
    </Layout>
  );
} 