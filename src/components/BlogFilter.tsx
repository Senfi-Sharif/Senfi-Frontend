import React, { useState } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';

interface BlogFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
}

export default function BlogFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  onClearFilters 
}: BlogFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  const handleCategorySelect = (category: string) => {
    onCategoryChange(category);
    setIsOpen(false);
  };

  const clearAllFilters = () => {
    onClearFilters();
    setIsOpen(false);
  };

  return (
    <div className="blog-filter-container">
      <div className="blog-filter-header">
        <button
          onClick={toggleFilter}
          className="blog-filter-toggle-btn"
          aria-expanded={isOpen}
        >
          <FaFilter className="blog-filter-icon" />
          فیلتر بر اساس دسته‌بندی
          {selectedCategory && (
            <span className="blog-filter-active-indicator">
              فعال
            </span>
          )}
        </button>
        
        {selectedCategory && (
          <button
            onClick={clearAllFilters}
            className="blog-filter-clear-btn"
            aria-label="پاک کردن فیلترها"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="blog-filter-dropdown">
          <div className="blog-filter-options">
            <button
              onClick={() => handleCategorySelect('')}
              className={`blog-filter-option ${!selectedCategory ? 'blog-filter-option-active' : ''}`}
            >
              همه مطالب
            </button>
            
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`blog-filter-option ${selectedCategory === category ? 'blog-filter-option-active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedCategory && (
        <div className="blog-filter-active">
          <span className="blog-filter-active-label">
            فیلتر فعال:
          </span>
          <span className="blog-filter-active-value">
            {selectedCategory}
          </span>
        </div>
      )}
    </div>
  );
} 