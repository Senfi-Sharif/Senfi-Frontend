import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import BlogSearch from '../components/BlogSearch';
import BlogFilter from '../components/BlogFilter';
import BlogPagination from '../components/BlogPagination';
import BlogSidebar from '../components/BlogSidebar';
import { FaNewspaper, FaCalendar, FaClock, FaUser, FaTag, FaPlus } from 'react-icons/fa';
import { useBlogData } from '../hooks/useBlogData';
import { SecureTokenManager } from '../utils/security';

export default function BlogEnhanced(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 3;

  // Get real blog data from custom hook
  const { blogPosts: realBlogPosts, categories, loading, error } = useBlogData();
  
  // Check if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = SecureTokenManager.getToken();
    const email = SecureTokenManager.getEmail();
    const role = SecureTokenManager.getRole();
    
    if (token && email) {
      const userData = {
        email: email,
        role: role || 'user'
      };
      setIsAuthenticated(true);
      setUser(userData);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  // Filter posts based on search query and category
  const filteredPosts = useMemo(() => {
    let filtered = realBlogPosts;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(post => {
        const titleMatch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
        const excerptMatch = post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Handle tags as array
        const tagsMatch = post.tags ? post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) : false;
        
        return titleMatch || excerptMatch || tagsMatch;
      });
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    return filtered;
  }, [realBlogPosts, searchQuery, selectedCategory]);

  // Paginate posts
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(startIndex, startIndex + postsPerPage);
  }, [filteredPosts, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout
      title="بلاگ"
      description="آخرین اخبار، اطلاعیه‌ها و به‌روزرسانی‌های شورای صنفی دانشجویان دانشگاه صنعتی شریف"
    >
      <div className="blog-enhanced-page">
        <div className="container">
          <div className="blog-enhanced-header">
            <div className="blog-enhanced-header-content">
              <div className="blog-enhanced-title-section">
            <h1 className="blog-enhanced-title">
              <FaNewspaper className="blog-enhanced-title-icon" />
                  بلاگ
            </h1>
            <p className="blog-enhanced-description">
                  آخرین اخبار، اطلاعیه‌ها و به‌روزرسانی‌های شورای صنفی دانشجویان دانشگاه صنعتی شریف به همراه مطالب شما
            </p>
              </div>
            </div>
          </div>
          {/* دکمه ایجاد بلاگ جدید فقط برای کاربران لاگین شده */}
          {isAuthenticated && (
            <div className="blog-enhanced-actions" style={{ marginTop: 12, marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
              <button
                className="blog-enhanced-create-btn"
                onClick={() => window.location.href = '/blog-create'}
                title="ایجاد مطلب جدید"
              >
                <FaPlus className="blog-enhanced-create-icon" />
                ایجاد مطلب جدید
              </button>
            </div>
          )}

          <div className="blog-enhanced-content">
            <div className="blog-enhanced-main">
              {/* Search and Filter Controls */}
              <div className="blog-enhanced-controls">
                <BlogSearch onSearch={handleSearch} />
                <BlogFilter
                  categories={categories.map(cat => cat.name)}
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                  onClearFilters={handleClearFilters}
                />
              </div>

              {/* Loading State */}
              {loading && (
                <div className="blog-enhanced-loading">
                  <div className="loading-spinner"></div>
                  <p>در حال بارگذاری مطالب...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="blog-enhanced-error">
                  <h3>خطا در بارگذاری مطالب</h3>
                  <p>{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="retry-button"
                  >
                    تلاش مجدد
                  </button>
                </div>
              )}

              {/* Blog Posts */}
              {!loading && !error && (
              <div className="blog-enhanced-posts">
                {paginatedPosts.length > 0 ? (
                  paginatedPosts.map((post) => (
                    <article key={post.id} className="blog-enhanced-post">
                      <header className="blog-enhanced-post-header">
                        <h2 className="blog-enhanced-post-title">
                          <a href={post.url} className="blog-enhanced-post-link">
                            {post.title}
                          </a>
                        </h2>
                        <div className="blog-enhanced-post-meta">
                          <span className="blog-enhanced-post-date">
                            <FaCalendar className="blog-enhanced-meta-icon" />
                            {formatDate(post.date)}
                          </span>
                          <span className="blog-enhanced-post-author">
                            <FaUser className="blog-enhanced-meta-icon" />
                            {post.author}
                          </span>
                          <span className="blog-enhanced-post-reading-time">
                            <FaClock className="blog-enhanced-meta-icon" />
                            {post.readingTime}
                          </span>
                        </div>
                        <div className="blog-enhanced-post-tags">
                          {post.tags.map((tag) => (
                            <span key={tag} className="blog-enhanced-post-tag">
                              <FaTag className="blog-enhanced-tag-icon" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </header>
                        
                        {/* Featured Image */}
                        {post.image_url && (
                          <div className="blog-enhanced-post-image">
                            <img 
                              src={post.image_url} 
                              alt={post.title}
                              className="post-image"
                              onError={(e) => {
                                console.error('Error loading image:', post.image_url);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                      <div className="blog-enhanced-post-excerpt">
                        {post.excerpt}
                      </div>
                      <footer className="blog-enhanced-post-footer">
                        <a href={post.url} className="blog-enhanced-read-more">
                          ادامه مطلب
                        </a>
                      </footer>
                    </article>
                  ))
                ) : (
                  <div className="blog-enhanced-empty">
                    <h3>نتیجه‌ای یافت نشد</h3>
                    <p>
                      {searchQuery || selectedCategory 
                        ? 'با فیلترهای انتخاب شده مطلبی یافت نشد. لطفاً فیلترها را تغییر دهید.'
                        : 'در حال حاضر مطلبی برای نمایش وجود ندارد.'
                      }
                    </p>
                  </div>
                )}
              </div>
              )}

              {/* Pagination */}
              {!loading && !error && totalPages > 1 && (
              <BlogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalPosts={filteredPosts.length}
                postsPerPage={postsPerPage}
              />
              )}
            </div>

            {/* Sidebar */}
            <div className="blog-enhanced-sidebar">
              <BlogSidebar
                recentPosts={paginatedPosts.slice(0, 3).map(post => ({
                  ...post,
                  id: post.id,
                  url: post.url,
                  created_at: (post as any).created_at || ''
                }))}
                categories={categories}
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