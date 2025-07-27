import React from 'react';
import { FaEdit, FaEye, FaClock, FaCheckCircle, FaTimesCircle, FaEyeSlash } from 'react-icons/fa';

interface UserCreatedBlogItemProps {
  blogPost: {
    id: number;
    title: string;
    slug: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
    excerpt?: string;
  };
  onClick: () => void;
}

export default function UserCreatedBlogItem({ blogPost, onClick }: UserCreatedBlogItemProps) {
  const getStatusIcon = (isPublished: boolean) => {
    if (isPublished) {
      return <FaCheckCircle style={{ color: '#28a745', marginLeft: 4 }} />;
    } else {
      return <FaEyeSlash style={{ color: '#6c757d', marginLeft: 4 }} />;
    }
  };

  const getStatusText = (isPublished: boolean) => {
    return isPublished ? 'منتشر شده' : 'پیش‌نویس';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="user-created-blog-item" onClick={onClick}>
      <div className="blog-header">
        <h3 className="blog-title">{blogPost.title}</h3>
        <div className="blog-status">
          {getStatusIcon(blogPost.is_published)}
          <span className={`status-text status-${blogPost.is_published ? 'published' : 'draft'}`}>
            {getStatusText(blogPost.is_published)}
          </span>
        </div>
      </div>
      
      {blogPost.excerpt && (
        <div className="blog-excerpt">
          <p>{blogPost.excerpt}</p>
        </div>
      )}
      
      <div className="blog-meta">
        <div className="meta-item">
          <FaClock style={{ marginLeft: 4, color: '#666' }} />
          <span>ایجاد شده: {formatDate(blogPost.created_at)}</span>
        </div>
        <div className="meta-item">
          <FaEdit style={{ marginLeft: 4, color: '#666' }} />
          <span>آخرین ویرایش: {formatDate(blogPost.updated_at)}</span>
        </div>
        <div className="meta-item">
          <FaEye style={{ marginLeft: 4, color: '#666' }} />
          <span>مشاهده</span>
        </div>
      </div>
    </div>
  );
} 