import React, { useState, useEffect, useMemo, ReactNode } from 'react';

interface FilterOption {
  key: string;
  label: string;
}

interface SortOption {
  key: string;
  label: string;
}

interface SidebarCategory {
  name: string;
  count: number;
}

interface GenericListPageProps<T> {
  title: string;
  description?: string;
  items: T[];
  loading: boolean;
  error: string;
  searchPlaceholder?: string;
  onSearch: (query: string) => void;
  filterOptions: string[];
  filterLabel?: string;
  filterValue: string[];
  onFilterChange: (selected: string[]) => void;
  sortOptions: SortOption[];
  sortValue: string;
  onSortChange: (key: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  renderItem: (item: T) => ReactNode;
  sidebar?: ReactNode;
  onClearFilters?: () => void;
  createButton?: ReactNode;
  emptyState?: ReactNode;
}

export default function GenericListPage<T>({
  title,
  description,
  items,
  loading,
  error,
  searchPlaceholder = 'جستجو...',
  onSearch,
  filterOptions,
  filterLabel = 'دسته‌بندی',
  filterValue,
  onFilterChange,
  sortOptions,
  sortValue,
  onSortChange,
  currentPage,
  totalPages,
  onPageChange,
  renderItem,
  sidebar,
  onClearFilters,
  createButton,
  emptyState
}: GenericListPageProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const filterDropdownRef = React.useRef<HTMLDivElement>(null);
  const sortDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setFilterDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterSummary = filterValue.length === filterOptions.length
    ? `همه ${filterLabel}‌ها`
    : filterValue.length === 0
      ? `هیچ ${filterLabel}ی انتخاب نشده`
      : filterValue.length <= 2
        ? filterValue.join('، ')
        : `${filterValue.length} ${filterLabel} انتخاب شده`;

  const sortSummary = sortOptions.find(f => f.key === sortValue)?.label || sortOptions[0]?.label || '';

  return (
    <div className="container">
      <div className="blog-enhanced-content">
        <div className="blog-enhanced-main">
          <div className="blog-enhanced-header">
            <h1 className="blog-enhanced-title">{title}</h1>
            {description && <div className="blog-enhanced-description">{description}</div>}
          </div>
          <div className="blog-enhanced-controls" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            {createButton}
            <div className="blog-search-container">
              <div className="blog-search-input-wrapper">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="blog-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); onSearch(''); }}
                    className="blog-search-clear-btn"
                    aria-label="پاک کردن جستجو"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            {/* Filter Dropdown */}
            <div style={{ position: 'relative' }} ref={filterDropdownRef}>
              <button
                type="button"
                className="dropdown-button"
                onClick={() => setFilterDropdownOpen(v => !v)}
                style={{ minWidth: 120 }}
              >
                <span>{filterSummary}</span>
                <span style={{ marginRight: 6 }}>{filterDropdownOpen ? '▲' : '▼'}</span>
              </button>
              {filterDropdownOpen && (
                <div className="dropdown-menu" style={{ minWidth: 180, maxHeight: 260, overflowY: 'auto', zIndex: 20, position: 'absolute', background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px #0001', marginTop: 4 }}>
                  {filterOptions.map(option => (
                    <label key={option} className="dropdown-checkbox-label" style={{ display: 'block', padding: '6px 12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={filterValue.includes(option)}
                        onChange={() => {
                          if (filterValue.includes(option)) {
                            onFilterChange(filterValue.filter(f => f !== option));
                          } else {
                            onFilterChange([...filterValue, option]);
                          }
                        }}
                        style={{ marginLeft: 8 }}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {/* Sort Dropdown */}
            <div style={{ position: 'relative' }} ref={sortDropdownRef}>
              <button
                type="button"
                className="dropdown-button"
                onClick={() => setSortDropdownOpen(v => !v)}
                style={{ minWidth: 120 }}
              >
                <span>{sortSummary}</span>
                <span style={{ marginRight: 6 }}>{sortDropdownOpen ? '▲' : '▼'}</span>
              </button>
              {sortDropdownOpen && (
                <div className="dropdown-menu" style={{ minWidth: 160, zIndex: 20, position: 'absolute', background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px #0001', marginTop: 4 }}>
                  {sortOptions.map(f => (
                    <label key={f.key} className="dropdown-checkbox-label" style={{ display: 'block', padding: '6px 12px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="sortType"
                        checked={sortValue === f.key}
                        onChange={() => { onSortChange(f.key); setSortDropdownOpen(false); }}
                        style={{ marginLeft: 8 }}
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {onClearFilters && (
              <button
                type="button"
                className="dropdown-button"
                style={{ minWidth: 80 }}
                onClick={onClearFilters}
              >
                پاک‌سازی فیلترها
              </button>
            )}
          </div>
          {/* Loading State */}
          {loading && (
            <div className="blog-enhanced-loading">
              <div className="loading-spinner"></div>
              <p>در حال بارگذاری...</p>
            </div>
          )}
          {/* Error State */}
          {error && (
            <div className="blog-enhanced-error">
              <h3>خطا در بارگذاری</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="retry-button">تلاش مجدد</button>
            </div>
          )}
          {/* List Items */}
          {!loading && !error && (
            <div className="blog-enhanced-posts">
              {items.length > 0 ? (
                items.map(renderItem)
              ) : (
                emptyState || (
                  <div className="blog-enhanced-empty">
                    <h3>نتیجه‌ای یافت نشد</h3>
                    <p>با فیلترهای انتخاب شده آیتمی یافت نشد. لطفاً فیلترها را تغییر دهید.</p>
                  </div>
                )
              )}
            </div>
          )}
          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="blog-pagination-container">
              <div className="blog-pagination-controls">
                <button
                  className="blog-pagination-btn"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  قبلی
                </button>
                <span className="blog-pagination-info">
                  صفحه {currentPage} از {totalPages}
                </span>
                <button
                  className="blog-pagination-btn"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  بعدی
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Sidebar */}
        <div className="blog-enhanced-sidebar">
          {sidebar}
        </div>
      </div>
    </div>
  );
} 