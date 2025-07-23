import React, { useEffect, useState, useMemo } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Link } from 'react-router-dom';
import { SecureTokenManager } from '../utils/security';
import BlogSidebar from '../components/BlogSidebar';
import BlogSearch from '../components/BlogSearch';
import BlogPagination from '../components/BlogPagination';
import { FaTag, FaClock, FaChevronDown, FaChevronUp, FaCheckCircle, FaListUl, FaVoteYea, FaUserSecret, FaUsers, FaChartBar } from 'react-icons/fa';

export default function PollsPage() {
  const { siteConfig } = useDocusaurusContext();
  const API_BASE = siteConfig.customFields.apiUrl;
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [userFaculty, setUserFaculty] = useState('');
  const [userDormitory, setUserDormitory] = useState('');
  const [userRole, setUserRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [labelChoices, setLabelChoices] = useState<string[]>([]);
  const [labelFilter, setLabelFilter] = useState<string[]>([]);
  const [labelDropdownOpen, setLabelDropdownOpen] = useState(false);
  const labelDropdownRef = React.useRef<HTMLDivElement>(null);
  const [showOpen, setShowOpen] = useState(true);
  const [showClosed, setShowClosed] = useState(true);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = React.useRef<HTMLDivElement>(null);
  const SORT_FILTERS = [
    { key: 'created_at', label: 'جدیدترین' },
    { key: 'deadline', label: 'نزدیک‌ترین ددلاین' },
    { key: 'total_votes', label: 'بیشترین رأی' },
  ];
  const [sortType, setSortType] = useState<'created_at' | 'deadline' | 'total_votes'>('created_at');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = React.useRef<HTMLDivElement>(null);
  const sortSummary = SORT_FILTERS.find(f => f.key === sortType)?.label || 'جدیدترین';
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserFaculty(localStorage.getItem('faculty') || '');
      setUserDormitory(localStorage.getItem('dormitory') || '');
      setUserRole(SecureTokenManager.getRole() || '');
    }
  }, []);

  // استخراج دسته‌بندی‌ها و شمارش هر دسته
  const categories = useMemo(() => {
    const catMap: Record<string, number> = {};
    polls.forEach((p: any) => {
      if (p.category) catMap[p.category] = (catMap[p.category] || 0) + 1;
    });
    return Object.keys(catMap).map(name => ({ name, count: catMap[name] }));
  }, [polls]);

  // Fetch label choices from backend (categories)
  useEffect(() => {
    const token = SecureTokenManager.getToken();
    fetch(`${API_BASE}/api/campaigns/categories`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setLabelChoices(data.categories || []);
        if (labelFilter.length === 0 && data.categories) setLabelFilter(data.categories);
      });
    // eslint-disable-next-line
  }, [API_BASE]);

  // Label filter summary
  const labelSummary = labelFilter.length === labelChoices.length
    ? 'همه دسته‌بندی‌ها'
    : labelFilter.length === 0
      ? 'هیچ دسته‌ای انتخاب نشده'
      : labelFilter.length <= 2
        ? labelFilter.join('، ')
        : `${labelFilter.length} دسته انتخاب شده`;

  // Handle label checkbox
  const handleLabelCheckbox = (label: string) => {
    setLabelFilter(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  // Filtered polls logic
  const filteredPolls = useMemo(() => {
    let result = polls;
    if (labelFilter.length === 0) return [];
    if (labelFilter.length < labelChoices.length) {
      result = result.filter((p: any) => labelFilter.includes(p.category));
    }
    // Open/closed filter
    if (!showOpen || !showClosed) {
      const now = new Date();
      result = result.filter((p: any) => {
        const isClosed = p.deadline && new Date(p.deadline) < now;
        if (showClosed && isClosed) return true;
        if (showOpen && !isClosed) return true;
        return false;
      });
    }
    // Search
    if (searchQuery.trim()) {
      const s = searchQuery.trim().toLowerCase();
      result = result.filter((p: any) =>
        (p.title && p.title.toLowerCase().includes(s)) ||
        (p.description && p.description.toLowerCase().includes(s))
      );
    }
    // Sort
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
  }, [polls, labelFilter, searchQuery, sortType, showOpen, showClosed, labelChoices]);

  // Pagination
  const totalPages = Math.ceil(filteredPolls.length / postsPerPage);
  const paginatedPolls = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredPolls.slice(startIndex, startIndex + postsPerPage);
  }, [filteredPolls, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, labelFilter, showOpen, showClosed, sortType]);

  const handleSearch = (query: string) => setSearchQuery(query);
  const handleClearFilters = () => {
    setSearchQuery('');
    setLabelFilter(labelChoices);
    setShowOpen(true);
    setShowClosed(true);
    setSortType('created_at');
  };

  // سایدبار: آخرین نظرسنجی‌ها (۳ تا)
  const recentPolls = polls.slice(0, 3).map(p => ({
    ...p,
    id: p.id,
    url: `/poll-detail?id=${p.id}`
  }));

  return (
    <Layout>
      <div className="polls-page" style={{ maxWidth: 1200, margin: '0 auto', padding: 24, display: 'flex', gap: 32 }}>
        <div style={{ flex: 3 }}>
          <h1>نظرسنجی‌ها</h1>
          {isAuthenticated && (
            <div style={{ margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
              <button
                className="polls-create-btn"
                onClick={() => window.location.href = '/poll-create'}
                title="ایجاد نظرسنجی جدید"
                style={{ padding: '8px 20px', fontSize: 16, borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                + ایجاد نظرسنجی جدید
              </button>
            </div>
          )}
          {userRole === 'simple_user' && (
            <div style={{ margin: '12px 0', fontSize: 15, color: '#555' }}>
              {userFaculty && userFaculty !== 'نامشخص' && (
                <span style={{ marginLeft: 12 }}>دانشکده: <b>{userFaculty}</b></span>
              )}
              {userDormitory && userDormitory !== 'خوابگاهی نیستم' && (
                <span>خوابگاه: <b>{userDormitory}</b></span>
              )}
            </div>
          )}
          {/* کنترل‌های جستجو و فیلتر و سورت */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
            <BlogSearch onSearch={handleSearch} />
            {/* فیلتر لیبل */}
            <div style={{ position: 'relative' }} ref={labelDropdownRef}>
              <button
                type="button"
                className="dropdown-button"
                onClick={() => setLabelDropdownOpen(v => !v)}
                style={{ minWidth: 120 }}
              >
                <span>{labelSummary}</span>
                <span style={{ marginRight: 6 }}>{labelDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
              </button>
              {labelDropdownOpen && (
                <div className="dropdown-menu" style={{ minWidth: 180, maxHeight: 260, overflowY: 'auto', zIndex: 20, position: 'absolute', background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px #0001', marginTop: 4 }}>
                  {labelChoices.map(label => (
                    <label key={label} className="dropdown-checkbox-label" style={{ display: 'block', padding: '6px 12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={labelFilter.includes(label)}
                        onChange={() => handleLabelCheckbox(label)}
                        style={{ marginLeft: 8 }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {/* فیلتر باز/بسته بودن */}
            <div style={{ position: 'relative' }} ref={statusDropdownRef}>
              <button
                type="button"
                className="dropdown-button"
                onClick={() => setStatusDropdownOpen(v => !v)}
                style={{ minWidth: 120 }}
              >
                <span>وضعیت نظرسنجی</span>
                <span style={{ marginRight: 6 }}>{statusDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
              </button>
              {statusDropdownOpen && (
                <div className="dropdown-menu" style={{ minWidth: 160, zIndex: 20, position: 'absolute', background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px #0001', marginTop: 4 }}>
                  <label className="dropdown-checkbox-label" style={{ display: 'block', padding: '6px 12px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={showOpen} onChange={e => setShowOpen(e.target.checked)} style={{ marginLeft: 8 }} />باز
                  </label>
                  <label className="dropdown-checkbox-label" style={{ display: 'block', padding: '6px 12px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={showClosed} onChange={e => setShowClosed(e.target.checked)} style={{ marginLeft: 8 }} />بسته
                  </label>
                </div>
              )}
            </div>
            {/* فیلتر سورت */}
            <div style={{ position: 'relative' }} ref={sortDropdownRef}>
              <button
                type="button"
                className="dropdown-button"
                onClick={() => setSortDropdownOpen(v => !v)}
                style={{ minWidth: 120 }}
              >
                <span>{sortSummary}</span>
                <span style={{ marginRight: 6 }}>{sortDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
              </button>
              {sortDropdownOpen && (
                <div className="dropdown-menu" style={{ minWidth: 160, zIndex: 20, position: 'absolute', background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px #0001', marginTop: 4 }}>
                  {SORT_FILTERS.map(f => (
                    <label key={f.key} className="dropdown-checkbox-label" style={{ display: 'block', padding: '6px 12px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="sortType"
                        checked={sortType === f.key}
                        onChange={() => { setSortType(f.key as any); setSortDropdownOpen(false); }}
                        style={{ marginLeft: 8 }}
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              className="dropdown-button"
              style={{ minWidth: 80 }}
              onClick={handleClearFilters}
            >
              پاک‌سازی فیلترها
            </button>
          </div>
          {/* وضعیت بارگذاری */}
          {loading && <div style={{ margin: '32px 0' }}>در حال بارگذاری...</div>}
          {error && <div style={{ margin: '32px 0', color: '#a11d1d' }}>{error}</div>}
          {/* لیست نظرسنجی‌ها */}
          {!loading && !error && (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {paginatedPolls.length > 0 ? paginatedPolls.map(poll => {
                const isExpired = poll.deadline && new Date(poll.deadline) < new Date();
                const hasVoted = poll.has_voted;
                return (
                  <li key={poll.id} style={{
                    border: '1px solid #ccc',
                    borderRadius: 12,
                    marginBottom: 20,
                    padding: 20,
                    background: isExpired ? '#f8f8f8' : 'var(--ifm-color-primary-lightest, #f7fafd)',
                    opacity: isExpired ? 0.7 : 1,
                    position: 'relative',
                    boxShadow: hasVoted ? '0 0 0 2px #16a34a55' : undefined
                  }}>
                    {/* Expired banner */}
                    {isExpired && (
                      <div style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        background: '#cfa7a7',
                        color: '#a11d1d',
                        borderRadius: 20,
                        padding: '4px 18px',
                        fontWeight: 600,
                        fontSize: 15,
                        zIndex: 2
                      }}>
                        این نظرسنجی به پایان رسیده است
                      </div>
                    )}
                    {/* Voted banner */}
                    {hasVoted && (
                      <div style={{
                        margin: '1rem 0 0.5rem 0',
                        color: '#16a34a',
                        background: '#e6fbe8',
                        borderRadius: 8,
                        padding: '0.7em 1em',
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 500,
                        fontSize: '1.08em'
                      }}>
                        <FaCheckCircle style={{ marginLeft: 8 }} />
                        شما در این نظرسنجی شرکت کرده‌اید
                      </div>
                    )}
                    <h2
                      style={{
                        marginTop: 0,
                        color: isExpired ? 'var(--ifm-color-primary-lightest)' : 'var(--ifm-font-color-base, #222)',
                        padding: 10,
                        borderRadius: 6
                      }}
                    >
                      {poll.title}
                    </h2>
                    {/* Poll description */}
                    <div
                      style={{
                        color: isExpired ? 'var(--ifm-color-primary-lightest)' : 'var(--ifm-font-color-base, #222)',
                        marginBottom: 12
                      }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: poll.description }} />
                    </div>
                    <div style={{ 
                      backgroundColor: 'var(--ifm-color-primary-lightest, #f7fafd)', 
                      borderRadius: 12, 
                      padding: 16, 
                      marginBottom: 16, 
                      fontSize: 15, 
                      color: 'var(--ifm-font-color-base, #222)',
                      border: '1px solid var(--ifm-color-emphasis-200, #e3e3e3)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <FaTag style={{ marginLeft: 8, color: '#1976d2' }} />
                        <span>دسته‌بندی: <b style={{ color: '#1976d2' }}>{poll.category}</b></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <FaListUl style={{ marginLeft: 8, color: '#16a34a' }} />
                        <span>تعداد گزینه‌ها: <b style={{ color: '#16a34a' }}>{poll.options ? poll.options.length : '-'}</b></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <FaVoteYea style={{ marginLeft: 8, color: '#dc2626' }} />
                        <span>نوع رأی: <b style={{ color: '#dc2626' }}>{poll.is_multiple_choice ? 'چندگزینه‌ای' : 'تکی'}</b></span>
                      </div>
                      {poll.is_multiple_choice && (
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          <FaChartBar style={{ marginLeft: 8, color: '#7c3aed' }} />
                          <span>حداکثر انتخاب مجاز: <b style={{ color: '#7c3aed' }}>{poll.max_choices ? (poll.max_choices === -1 ? 'نامحدود' : poll.max_choices) : 'نامحدود'}</b></span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <FaUserSecret style={{ marginLeft: 8, color: '#ea580c' }} />
                        <span>رأی: <b style={{ color: '#ea580c' }}>{poll.is_anonymous ? 'ناشناس' : 'شناس'}</b></span>
                      </div>
                      {typeof poll.total_votes !== 'undefined' && (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <FaUsers style={{ marginLeft: 8, color: '#059669' }} />
                          <span>تعداد کل رأی‌ها: <b style={{ color: '#059669' }}>{poll.total_votes}</b></span>
                        </div>
                      )}
                    </div>
                    {/* Poll results as graphical bars if there are votes */}
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
                    <p style={{ margin: '10px 0 0 0', color: '#555', fontSize: 15 }}>
                      <FaClock style={{ marginLeft: 6, opacity: 0.7 }} />
                      ددلاین: {new Date(poll.deadline).toLocaleString('fa-IR')}
                    </p>
                    <Link to={`/poll-detail?id=${poll.id}`} style={{
                      display: 'inline-block',
                      marginTop: 16,
                      padding: '8px 22px',
                      background: '#1976d2',
                      color: '#fff',
                      borderRadius: 8,
                      fontWeight: 600,
                      textDecoration: 'none',
                      fontSize: 16
                    }}>
                      {(isExpired || poll.has_voted) ? 'مشاهده' : 'مشاهده و رأی دادن'}
                    </Link>
                </li>
                );
              }) : (
                <div style={{ margin: '48px 0', textAlign: 'center', color: '#888' }}>
                  <h3>در حال حاضر نظرسنجی‌ای برای نمایش وجود ندارد.</h3>
                  <p>به محض ایجاد و تایید نظرسنجی، اینجا نمایش داده خواهد شد.</p>
                </div>
              )}
            </ul>
          )}
          {/* صفحه‌بندی */}
          {!loading && !error && totalPages > 1 && (
            <BlogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalPosts={filteredPolls.length}
              postsPerPage={postsPerPage}
            />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <BlogSidebar
            recentPosts={polls.slice(0, 3).map(p => ({
              ...p,
              id: p.id,
              url: `/poll-detail?id=${p.id}`
            }))}
            categories={labelChoices.map(lab => ({ name: lab, count: polls.filter(p => p.category === lab).length }))}
            onCategoryClick={cat => setLabelFilter([cat])}
            selectedCategory={labelFilter[0] || ''}
          />
        </div>
      </div>
    </Layout>
  );
} 