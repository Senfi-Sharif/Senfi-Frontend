import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface BlogSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function BlogSearch({ onSearch, placeholder = "جستجو..." }: BlogSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        onSearch(searchQuery.trim());
        setIsSearching(false);
      } else {
        onSearch('');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="blog-search-container">
      <div className="blog-search-input-wrapper">
        <FaSearch className="blog-search-icon" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="blog-search-input"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="blog-search-clear-btn"
            aria-label="پاک کردن جستجو"
          >
            <FaTimes />
          </button>
        )}
      </div>
      {isSearching && (
        <div className="blog-search-loading">
          در حال جستجو...
        </div>
      )}
    </div>
  );
} 