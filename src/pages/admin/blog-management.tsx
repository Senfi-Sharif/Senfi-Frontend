import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaSave, FaTimes } from 'react-icons/fa';
import RichTextEditor from '../../components/RichTextEditor';
import { SecureTokenManager } from '../../utils/security';
import AdminSidebar from '../../components/AdminSidebar';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
  image_url: string;
  is_published: boolean;
  created_at: string;
  published_at: string;
  reading_time: number;
  author_email: string;
}

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string;
  category: string;
  image_url: string;
  reading_time: number;
}

export default function AdminBlogManagementPage(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const API_BASE = siteConfig.customFields.apiUrl;
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    tags: '',
    category: 'عمومی',
    image_url: '',
    reading_time: 5
  });

  // Check if user is super admin
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [categoryChoices, setCategoryChoices] = useState<string[]>([]);

  useEffect(() => {
    // Check authentication
    const token = SecureTokenManager.getToken();
    if (token) {
      setUserToken(token);
      checkUserRole(token);
    }
  }, []);

  useEffect(() => {
    const token = SecureTokenManager.getToken();
    fetch(`${API_BASE}/api/campaigns/categories`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setCategoryChoices(data.categories || []);
      })
      .catch(() => {
        setCategoryChoices(["مسائل دانشگاهی"]);
      });
  }, [API_BASE]);

  const checkUserRole = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setIsSuperAdmin(userData.role === 'superadmin' || userData.role === 'center_member' || userData.role === 'head');
      } else {
        console.error('Failed to get user data:', response.status);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/admin/blog/posts`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      
      const data = await response.json();
      setPosts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken && isSuperAdmin) {
      fetchPosts();
    }
  }, [userToken, isSuperAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content: content
    }));
  };

  const generateSlug = (title: string) => {
    // Convert Persian numbers to English
    const persianToEnglish = {
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
      '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
    };
    
    let slug = title;
    
    // Replace Persian numbers with English
    Object.entries(persianToEnglish).forEach(([persian, english]) => {
      slug = slug.replace(new RegExp(persian, 'g'), english);
    });
    
    // Convert to lowercase and replace spaces with hyphens
    slug = slug
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Remove any non-alphanumeric characters except hyphens and underscores
    slug = slug.replace(/[^a-z0-9\-_]/g, '');
    
    // Ensure slug starts and ends with alphanumeric
    slug = slug.replace(/^[^a-z0-9]+/, '').replace(/[^a-z0-9]+$/, '');
    
    // If slug is empty, use a default
    if (!slug) {
      slug = 'blog-post-' + Date.now();
    }
    
    return slug;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userToken) {
      setError('لطفاً ابتدا وارد شوید');
      return;
    }

    try {
      // Clean and validate slug before sending
      let cleanSlug = formData.slug;
      if (cleanSlug) {
        // Convert Persian numbers to English
        const persianToEnglish = {
          '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
          '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
        };
        
        Object.entries(persianToEnglish).forEach(([persian, english]) => {
          cleanSlug = cleanSlug.replace(new RegExp(persian, 'g'), english);
        });
        
        // Convert to lowercase and replace spaces with hyphens
        cleanSlug = cleanSlug
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        
        // Remove any non-alphanumeric characters except hyphens and underscores
        cleanSlug = cleanSlug.replace(/[^a-z0-9\-_]/g, '');
        
        // Ensure slug starts and ends with alphanumeric
        cleanSlug = cleanSlug.replace(/^[^a-z0-9]+/, '').replace(/[^a-z0-9]+$/, '');
        
        // If slug is empty, use a default
        if (!cleanSlug) {
          cleanSlug = 'blog-post-' + Date.now();
        }
      }

      const postData = {
        ...formData,
        slug: cleanSlug,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

            const url = editingPost
        ? `${API_BASE}/api/admin/blog/posts/${editingPost.id}`
        : `${API_BASE}/api/admin/blog/posts/create`;
      
      const method = editingPost ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error('Failed to save blog post');
      }

      // Reset form and refresh posts
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        tags: '',
        category: 'عمومی',
        image_url: '',
        reading_time: 5
      });
      setShowForm(false);
      setEditingPost(null);
      fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blog post');
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      tags: post.tags.join(', '),
      category: post.category,
      image_url: post.image_url,
      reading_time: post.reading_time
    });
    setShowForm(true);
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این مطلب را حذف کنید؟')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/blog/posts/${postId}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete blog post');
      }

      fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog post');
    }
  };

  const handlePublish = async (postId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/blog/posts/${postId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle publish status');
      }

      fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle publish status');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
  };

  // اگر جایی دسته‌بندی‌ها را فیلتر می‌کردی (مثلاً categoryChoices.filter(...))، حذف کن و فقط از categoryChoices استفاده کن

  if (!userToken) {
    return (
      <Layout title="مدیریت بلاگ" description="مدیریت مطالب بلاگ">
          <div className="container">
            <div className="auth-required">
              <h2>نیاز به ورود</h2>
              <p>لطفاً ابتدا وارد شوید تا بتوانید مطالب بلاگ را مدیریت کنید.</p>
            </div>
          </div>
      </Layout>
    );
  }
  if (!isSuperAdmin) {
    return (
      <Layout title="مدیریت بلاگ" description="مدیریت مطالب بلاگ">
          <div className="container">
            <div className="access-denied">
              <h2>دسترسی محدود</h2>
              <p>فقط ادمین، عضو مرکز یا دبیر شورا می‌تواند مطالب بلاگ را مدیریت کند.</p>
            </div>
          </div>
      </Layout>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar current="blog" />
      <div style={{ flex: 1 }}>
    <Layout title="مدیریت بلاگ" description="مدیریت مطالب بلاگ">
        <div className="container">
          <div className="blog-management-header">
            <h1>مدیریت مطالب بلاگ</h1>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Blog Post Form */}
          {showForm && (
            <div className="blog-form-overlay">
              <div className="blog-form">
                <div className="form-header">
                  <h2>{editingPost ? 'ویرایش مطلب' : 'مطلب جدید'}</h2>
                  <button onClick={() => setShowForm(false)} className="close-button">
                    <FaTimes />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="title">عنوان *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleTitleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="slug">شناسه URL</label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="content">محتوا *</label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={handleContentChange}
                      placeholder="محتوای مطلب را بنویسید..."
                      height="300px"
                      className="blog-management-editor"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="excerpt">خلاصه</label>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="category">دسته‌بندی</label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                            className="form-select"
                            required
                          >
                            {categoryChoices.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="reading_time">زمان مطالعه (دقیقه)</label>
                      <input
                        type="number"
                        id="reading_time"
                        name="reading_time"
                        value={formData.reading_time}
                        onChange={handleInputChange}
                        min="1"
                        max="60"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="tags">برچسب‌ها (با کاما جدا کنید)</label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="مثال: اخبار، اطلاعیه، دانشگاه"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="image_url">آدرس تصویر</label>
                    <input
                      type="url"
                      id="image_url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="save-button">
                      <FaSave />
                      {editingPost ? 'به‌روزرسانی' : 'ذخیره'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowForm(false)}
                      className="cancel-button"
                    >
                      <FaTimes />
                      انصراف
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Blog Posts List */}
          {loading ? (
            <div className="loading">
              <p>در حال بارگذاری...</p>
            </div>
          ) : (
            <div className="blog-posts-list">
              {posts.length === 0 ? (
                <div className="empty-state">
                  <p>هیچ مطلبی یافت نشد.</p>
                </div>
              ) : (
                posts.map(post => (
                  <div key={post.id} className="blog-post-item">
                    <div className="post-info">
                      <h3>{post.title}</h3>
                      <div className="post-meta">
                        <span className="post-date">{formatDate(post.created_at)}</span>
                        <span className="post-author">{post.author_email}</span>
                        <span className="post-category">{post.category}</span>
                        <span className={`post-status ${post.is_published ? 'published' : 'draft'}`}>
                          {post.is_published ? 'منتشر شده' : 'پیش‌نویس'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="post-actions">
                      <button 
                        onClick={() => handlePublish(post.id)}
                        className={`publish-button ${post.is_published ? 'unpublish' : 'publish'}`}
                        title={post.is_published ? 'عدم انتشار' : 'انتشار'}
                      >
                        {post.is_published ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button 
                        onClick={() => handleEdit(post)}
                        className="edit-button"
                        title="ویرایش"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="delete-button"
                        title="حذف"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
    </Layout>
      </div>
    </div>
  );
} 