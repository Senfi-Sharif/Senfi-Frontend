import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import BlogSidebar from '../components/BlogSidebar';
import GeneralSidebar from '../components/GeneralSidebar';
import { FaPlus } from 'react-icons/fa';
import { useBlogData } from '../hooks/useBlogData';
import { SecureTokenManager } from '../utils/security';
import GenericListPage from '../components/GenericListPage';

export default function BlogEnhanced(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortType, setSortType] = useState('created_at');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 3;

  // Get real blog data from custom hook
  const { blogPosts: realBlogPosts, categories, loading, error } = useBlogData();

  // Check if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const token = SecureTokenManager.getToken();
    setIsAuthenticated(!!token);
  }, []);

  // Prepare category options
  const categoryOptions = useMemo(() => categories.map(cat => cat.name), [categories]);
  useEffect(() => {
    if (selectedCategories.length === 0 && categoryOptions.length > 0) {
      setSelectedCategories(categoryOptions);
    }
  }, [categoryOptions]);

  // Filter, search, sort
  const filteredPosts = useMemo(() => {
    let filtered = realBlogPosts;
    if (searchQuery) {
      filtered = filtered.filter(post => {
        const titleMatch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
        const excerptMatch = post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const tagsMatch = post.tags ? post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) : false;
        return titleMatch || excerptMatch || tagsMatch;
      });
    }
    if (selectedCategories.length > 0 && selectedCategories.length < categoryOptions.length) {
      filtered = filtered.filter(post => selectedCategories.includes(post.category));
    }
    let sorted = [...filtered];
    if (sortType === 'created_at') {
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortType === 'reading_time') {
      sorted.sort((a, b) => (parseInt(b.readingTime) || 0) - (parseInt(a.readingTime) || 0));
    }
    return sorted;
  }, [realBlogPosts, searchQuery, selectedCategories, sortType, categoryOptions]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(startIndex, startIndex + postsPerPage);
  }, [filteredPosts, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategories, sortType]);

  // Sidebar
  const sidebar = (
    <BlogSidebar
      recentPosts={paginatedPosts.slice(0, 3).map(post => ({
        ...post,
        id: post.id,
        url: post.url,
        created_at: (post as any).created_at || ''
      }))}
      categories={categories}
      onCategoryClick={cat => setSelectedCategories([cat])}
      selectedCategory={selectedCategories[0] || ''}
      statsTitle="آمار بلاگ"
    />
  );

  // Sort options
  const sortOptions = [
    { key: 'created_at', label: 'جدیدترین' },
    { key: 'reading_time', label: 'زمان مطالعه' },
  ];

  // Create button
  const createButton = isAuthenticated ? (
    <button
      className="blog-enhanced-create-btn"
      onClick={() => window.location.href = '/blog-create'}
      title="ایجاد مطلب جدید"
    >
      <FaPlus className="blog-enhanced-create-icon" />
      ایجاد مطلب جدید
    </button>
  ) : null;

  // Render item
  const renderItem = (post: any) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    return (
      <article key={post.id} className="blog-enhanced-post">
        <header className="blog-enhanced-post-header">
          <h2 className="blog-enhanced-post-title">
            <a href={post.url} className="blog-enhanced-post-link">
              {post.title}
            </a>
          </h2>
          <div className="blog-enhanced-post-meta">
            <span className="blog-enhanced-post-date">{formatDate(post.date)}</span>
            <span className="blog-enhanced-post-author">{post.author}</span>
            <span className="blog-enhanced-post-reading-time">{post.readingTime}</span>
            {post.category && (
              <span className="blog-enhanced-post-category" style={{ marginRight: 8, fontWeight: 500, color: '#1e40af', display: 'inline-block' }}>
                {post.category}
              </span>
            )}
          </div>
          <div className="blog-enhanced-post-tags">
            {post.tags.map((tag: string) => (
              <span key={tag} className="blog-enhanced-post-tag">{tag}</span>
            ))}
          </div>
        </header>
        {post.image_url && (
          <div className="blog-enhanced-post-image">
            <img
              src={post.image_url}
              alt={post.title}
              className="post-image"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
        <div className="blog-enhanced-post-excerpt">{post.excerpt}</div>
        <footer className="blog-enhanced-post-footer">
          <a href={post.url} className="blog-enhanced-read-more">ادامه مطلب</a>
        </footer>
      </article>
    );
  };

  return (
    <Layout title="بلاگ" description="آخرین اخبار، اطلاعیه‌ها و به‌روزرسانی‌های شورای صنفی دانشجویان دانشگاه صنعتی شریف">
      <div style={{ display: 'flex', flexDirection: 'row', minHeight: 'calc(100vh - 60px)' }}>
        <GeneralSidebar current="blog" />
        <div style={{ flex: 1 }}>
      <GenericListPage
        title="بلاگ"
        description="آخرین اخبار، اطلاعیه‌ها و به‌روزرسانی‌های شورای صنفی دانشجویان دانشگاه صنعتی شریف"
        items={paginatedPosts}
        loading={loading}
        error={error || ''}
        searchPlaceholder="جستجو در مطالب..."
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