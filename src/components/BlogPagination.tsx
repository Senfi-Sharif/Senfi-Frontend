import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalPosts: number;
  postsPerPage: number;
}

export default function BlogPagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalPosts, 
  postsPerPage 
}: BlogPaginationProps) {
  const startPost = (currentPage - 1) * postsPerPage + 1;
  const endPost = Math.min(currentPage * postsPerPage, totalPosts);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number') {
      onPageChange(page);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="blog-pagination-container">
      <div className="blog-pagination-info">
        نمایش {startPost} تا {endPost} از {totalPosts} مطلب
      </div>
      
      <div className="blog-pagination-controls">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="blog-pagination-btn blog-pagination-prev"
          aria-label="صفحه قبلی"
        >
          <FaChevronLeft />
          قبلی
        </button>

        <div className="blog-pagination-pages">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => handlePageClick(page)}
              className={`blog-pagination-page-btn ${
                page === currentPage ? 'blog-pagination-page-active' : ''
              } ${page === '...' ? 'blog-pagination-ellipsis' : ''}`}
              disabled={page === '...'}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="blog-pagination-btn blog-pagination-next"
          aria-label="صفحه بعدی"
        >
          بعدی
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
} 