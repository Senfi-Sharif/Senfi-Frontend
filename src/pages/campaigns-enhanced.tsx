import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import BlogSearch from '../components/BlogSearch';
import BlogFilter from '../components/BlogFilter';
import BlogPagination from '../components/BlogPagination';
import BlogSidebar from '../components/BlogSidebar';
import { FaBullhorn, FaCalendar, FaClock, FaUser, FaTag, FaPlus, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { SecureTokenManager } from '../utils/security';
import CampaignSignatures from '../components/CampaignSignatures';
import { useAuthApi } from '../api/auth';
import moment from 'moment-jalaali';

export default function CampaignsEnhanced(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const API_BASE = siteConfig.customFields.apiUrl;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 3;

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  // فیلتر امضا شده/نشده به صورت dropdown با دو چک‌باکس
  const [signedDropdownOpen, setSignedDropdownOpen] = useState(false);
  const signedDropdownRef = React.useRef<HTMLDivElement>(null);
  // فیلتر باز/بسته بودن به صورت dropdown با دو چک‌باکس
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = React.useRef<HTMLDivElement>(null);
  const [showSigned, setShowSigned] = useState(true);
  const [showUnsigned, setShowUnsigned] = useState(true);
  const [showOpen, setShowOpen] = useState(true);
  const [showClosed, setShowClosed] = useState(true);

  // تعریف stateهای labelChoices و متغیرهای مرتبط در ابتدای فایل
  const [labelChoices, setLabelChoices] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    const token = SecureTokenManager.getToken();
    const email = SecureTokenManager.getEmail();
    const role = SecureTokenManager.getRole();
    if (token && email) {
      setIsAuthenticated(true);
      setUser({ email, role: role || 'user' });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const authApi = useAuthApi();

  useEffect(() => {
    setLoading(true);
    authApi.getApprovedCampaigns()
      .then(data => {
        const list = data.campaigns || [];
        setCampaigns(list);
        // استخراج دسته‌بندی‌ها و شمارش هر دسته
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

  // --- فیلتر دسته‌بندی ---
  const ALL_POSSIBLE_CATEGORIES = [
    "مسائل دانشگاهی",
    "فیزیک", "صنایع", "کامپیوتر", "برق", "عمران", "مواد", "مهندسی شیمی و نفت", "ریاضی", "هوافضا", "انرژی", "مدیریت و اقتصاد", "شیمی", "مکانیک",
    "احمدی روشن", "طرشت ۲", "طرشت ۳", "خوابگاهی نیستم"
  ];
  // تعریف stateهای لیبل فیلتر و متغیرهای مربوطه
  const [labelFilter, setLabelFilter] = useState<string[]>([]);
  const [labelDropdownOpen, setLabelDropdownOpen] = useState(false);
  const labelDropdownRef = React.useRef<HTMLDivElement>(null);

  // مقداردهی اولیه labelFilter فقط یک بار بعد از دریافت labelChoices
  useEffect(() => {
    if (labelChoices.length > 0 && labelFilter.length === 0) {
      setLabelFilter(labelChoices);
    }
    // eslint-disable-next-line
  }, [labelChoices]);

  const labelSummary = labelFilter.length === labelChoices.length
    ? 'همه لیبل‌ها'
    : labelFilter.length === 0
      ? 'هیچ لیبلی انتخاب نشده'
      : labelFilter.length <= 2
        ? labelFilter.join('، ')
        : `${labelFilter.length} لیبل انتخاب شده`;

  // --- فیلتر سورت ---
  const SORT_FILTERS = [
    { key: 'created_at', label: 'جدیدترین' },
    { key: 'signature_count', label: 'بیشترین امضا' },
    { key: 'deadline', label: 'نزدیک‌ترین ددلاین' },
  ];
  const [sortType, setSortType] = useState<'created_at' | 'signature_count' | 'deadline'>('created_at');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = React.useRef<HTMLDivElement>(null);
  const sortSummary = SORT_FILTERS.find(f => f.key === sortType)?.label || 'جدیدترین';
  // --- لیبل‌ها (label) ---

  useEffect(() => {
    setCategoriesLoading(true);
    const token = SecureTokenManager.getToken();
    fetch(`${API_BASE}/api/campaigns/categories`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setLabelChoices(data.categories || []);
        setCategoriesLoading(false);
      })
      .catch(err => {
        setCategoriesError('خطا در دریافت دسته‌بندی‌ها');
        setCategoriesLoading(false);
      });
  }, [API_BASE]);

  // تابع handleLabelCheckbox
  const handleLabelCheckbox = (label: string) => {
    setLabelFilter(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  // ALL_CATEGORIES فقط برابر labelChoices باشد
  const ALL_CATEGORIES = labelChoices;

  // منطق فیلتر: اگر هیچ لیبلی انتخاب نشده بود، هیچ کارزاری نمایش داده نشود
  const filteredCampaigns = useMemo(() => {
    let result = campaigns;
    if (labelFilter.length === 0) {
      return [];
    }
    if (labelFilter.length < ALL_CATEGORIES.length) {
      result = result.filter((c: any) => labelFilter.includes(c.category));
    }
    // فیلتر امضا شده/نشده
    if (!showSigned || !showUnsigned) {
      result = result.filter((c: any) => {
        const hasSigned = c.has_signed; // باید مقدار has_signed از API بیاید
        if (showSigned && hasSigned) return true;
        if (showUnsigned && !hasSigned) return true;
        return false;
      });
    }
    // فیلتر باز/بسته بودن
    if (!showOpen || !showClosed) {
      const now = new Date();
      result = result.filter((c: any) => {
        const isClosed = c.deadline && new Date(c.deadline) < now;
        if (showClosed && isClosed) return true;
        if (showOpen && !isClosed) return true;
        return false;
      });
    }
    // جستجو
    if (searchQuery.trim()) {
      const s = searchQuery.trim().toLowerCase();
      result = result.filter((c: any) =>
        (c.title && c.title.toLowerCase().includes(s)) ||
        (c.excerpt && c.excerpt.toLowerCase().includes(s))
      );
    }
    // سورت
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
  }, [campaigns, labelFilter, searchQuery, sortType, showSigned, showUnsigned, showOpen, showClosed, ALL_CATEGORIES]);

  // صفحه‌بندی
  const totalPages = Math.ceil(filteredCampaigns.length / postsPerPage);
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredCampaigns.slice(startIndex, startIndex + postsPerPage);
  }, [filteredCampaigns, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const handleSearch = (query: string) => setSearchQuery(query);
  const handleCategoryChange = (category: string) => setSelectedCategory(category);
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setLabelFilter(labelChoices); // همه لیبل‌ها انتخاب شوند
  };
  const handleCategoryClick = (category: string) => setSelectedCategory(category);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // تابع تبدیل اعداد انگلیسی به فارسی
  const toPersianDigits = (str: string) =>
    str.replace(/[0-9]/g, d => String.fromCharCode(d.charCodeAt(0) + 1728));

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const m = moment(dateString);
    const formatted = m.format('jYYYY/jMM/jDD [ساعت] HH:mm');
    return toPersianDigits(formatted);
  };

  // تابع isCampaignExpired
  const isCampaignExpired = (deadline: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <Layout
      title="کارزارها"
      description="لیست کارزارهای فعال و گذشته شورای صنفی دانشجویان دانشگاه صنعتی شریف"
    >
      <div className="blog-enhanced-page">
        <div className="container">
          <div className="blog-enhanced-header">
            <div className="blog-enhanced-header-content">
              <div className="blog-enhanced-title-section">
                <h1 className="blog-enhanced-title">
                  <FaBullhorn className="blog-enhanced-title-icon" />
                  کارزارها
                </h1>
                <p className="blog-enhanced-description">
                  لیست کارزارهای فعال و گذشته شورای صنفی دانشجویان دانشگاه صنعتی شریف
                </p>
              </div>
            </div>
          </div>
          {/* دکمه ایجاد کارزار جدید فقط برای کاربران لاگین شده */}
          {isAuthenticated && (
            <div className="blog-enhanced-actions" style={{ marginTop: 12, marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
              <button
                className="blog-enhanced-create-btn"
                onClick={() => window.location.href = '/campaign-create'}
                title="ایجاد کارزار جدید"
              >
                <FaPlus className="blog-enhanced-create-icon" />
                ایجاد کارزار جدید
              </button>
            </div>
          )}

          <div className="blog-enhanced-content">
            <div className="blog-enhanced-main">
              {/* کنترل‌های جستجو و فیلتر و سورت */}
              <div className="blog-enhanced-controls" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <BlogSearch onSearch={handleSearch} />
                {/* فیلتر دسته‌بندی */}
                {/* حذف کنترل فیلتر دسته‌بندی از UI */}
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
                      {ALL_CATEGORIES.map(label => (
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
                {/* فیلتر امضا شده/نشده */}
                <div style={{ position: 'relative' }} ref={signedDropdownRef}>
                  <button
                    type="button"
                    className="dropdown-button"
                    onClick={() => setSignedDropdownOpen(v => !v)}
                    style={{ minWidth: 120 }}
                  >
                    <span>وضعیت امضا</span>
                    <span style={{ marginRight: 6 }}>{signedDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
                  </button>
                  {signedDropdownOpen && (
                    <div className="dropdown-menu" style={{ minWidth: 160, zIndex: 20, position: 'absolute', background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px #0001', marginTop: 4 }}>
                      <label className="dropdown-checkbox-label" style={{ display: 'block', padding: '6px 12px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={showSigned} onChange={e => setShowSigned(e.target.checked)} style={{ marginLeft: 8 }} />امضا شده
                      </label>
                      <label className="dropdown-checkbox-label" style={{ display: 'block', padding: '6px 12px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={showUnsigned} onChange={e => setShowUnsigned(e.target.checked)} style={{ marginLeft: 8 }} />امضا نشده
                      </label>
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
                    <span>وضعیت کارزار</span>
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
              {loading && (
                <div className="blog-enhanced-loading">
                  <div className="loading-spinner"></div>
                  <p>در حال بارگذاری کارزارها...</p>
                </div>
              )}

              {/* وضعیت خطا */}
              {error && (
                <div className="blog-enhanced-error">
                  <h3>خطا در بارگذاری کارزارها</h3>
                  <p>{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="retry-button"
                  >
                    تلاش مجدد
                  </button>
                </div>
              )}

              {/* لیست کارزارها */}
              {!loading && !error && (
                <div className="blog-enhanced-posts">
                  {paginatedCampaigns.length > 0 ? (
                    paginatedCampaigns.map((c) => (
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
                          <span className="blog-enhanced-post-category" style={{ marginRight: 8, fontWeight: 500, color: '#1e40af', display: 'inline-block' }}>
                            <FaTag style={{ marginLeft: 4, opacity: 0.7 }} />
                            {c.category}
                          </span>
                          <div className="blog-enhanced-post-meta">
                            <span className="blog-enhanced-post-date">
                              <FaCalendar className="blog-enhanced-meta-icon" />
                              {formatDate(c.created_at)}
                            </span>
                            <span className="blog-enhanced-post-deadline" style={{ marginRight: 12, color: '#dc2626', fontWeight: 500 }}>
                              <FaClock className="blog-enhanced-meta-icon" />
                              ددلاین: {formatDateTime(c.deadline)}
                            </span>
                            <span className="blog-enhanced-post-author">
                              <FaUser className="blog-enhanced-meta-icon" />
                              {c.author_email}
                            </span>
                          </div>
                          <div className="blog-enhanced-post-tags">
                            {Array.isArray(c.tags) ? c.tags.map((tag: string) => (
                              <span key={tag} className="blog-enhanced-post-tag">
                                <FaTag className="blog-enhanced-tag-icon" />
                                {tag}
                              </span>
                            )) : null}
                          </div>
                        </header>
                        {c.image_url && (
                          <div className="blog-enhanced-post-image">
                            <img
                              src={c.image_url}
                              alt={c.title}
                              className="post-image"
                              onError={e => { e.currentTarget.style.display = 'none'; }}
                            />
                          </div>
                        )}
                        <div className="blog-enhanced-post-excerpt">
                          {c.excerpt}
                        </div>
                        {/* اگر کاربر این کارزار را امضا کرده باشد، پیام سبز نمایش بده */}
                        {c.has_signed && (
                          <div className="sign-campaign-success" style={{ margin: '1rem 0 0.5rem 0', color: '#16a34a', background: '#e6fbe8', borderRadius: 8, padding: '0.7em 1em', display: 'flex', alignItems: 'center', fontWeight: 500, fontSize: '1.08em' }}>
                            <svg style={{ marginLeft: 8 }} width="20" height="20" fill="#16a34a" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 6.293a1 1 0 010 1.414l-6.364 6.364a1 1 0 01-1.414 0l-3.182-3.182a1 1 0 111.414-1.414l2.475 2.475 5.657-5.657a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            شما این کارزار را امضا کرده‌اید
                          </div>
                        )}
                        {/* نمایش تعداد و اسامی امضاکنندگان */}
                        <div style={{ margin: '1.2rem 0 0.5rem 0' }}>
                          <CampaignSignatures campaignId={c.id} />
                        </div>
                        <footer className="blog-enhanced-post-footer">
                          <a href={`/campaign-detail?id=${c.id}`} className="blog-enhanced-read-more">
                            مشاهده جزئیات
                          </a>
                        </footer>
                      </article>
                    ))
                  ) : (
                    <div className="blog-enhanced-empty">
                      <h3>نتیجه‌ای یافت نشد</h3>
                      <p>
                        {searchQuery || selectedCategory
                          ? 'با فیلترهای انتخاب شده کارزاری یافت نشد. لطفاً فیلترها را تغییر دهید.'
                          : 'در حال حاضر کارزاری برای نمایش وجود ندارد.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* صفحه‌بندی */}
              {!loading && !error && totalPages > 1 && (
                <BlogPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalPosts={filteredCampaigns.length}
                  postsPerPage={postsPerPage}
                />
              )}
            </div>

            {/* سایدبار */}
            <div className="blog-enhanced-sidebar">
              <BlogSidebar
                recentPosts={campaigns.slice(0, 3).map(c => ({
                  ...c,
                  id: c.id,
                  url: `/campaign-detail?id=${c.id}`
                }))}
                categories={categories.map(cat => ({ name: cat, count: categoryCounts[cat] || 0 }))}
                onCategoryClick={handleCategoryClick}
                selectedCategory={selectedCategory}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 
 