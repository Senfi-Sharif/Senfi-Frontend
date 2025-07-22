import { useMemo, useState, useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

interface BlogPost {
  id: string;
  title: string;
  date: string;
  author: string;
  tags: string[];
  category: string;
  excerpt: string;
  readingTime: string;
  url: string;
  image_url?: string;
}

interface ApiBlogPost {
  id: number;
  title: string;
  slug: string;
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

interface BlogResponse {
  posts: ApiBlogPost[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
}

// Function to fetch blog data from Django API
const fetchBlogData = async (apiBase: string): Promise<BlogPost[]> => {
  try {
    const response = await fetch(`${apiBase}/api/blog/posts?page_size=50`);
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts');
    }
    
    const data: BlogResponse = await response.json();
    
    return data.posts.map(post => {
      let date = post.created_at;
      if (!date) {
        date = new Date().toISOString();
      }
      return {
        id: post.slug,
        title: post.title,
        date: date,
        author: post.author_email,
        tags: post.tags || [],
        category: post.category,
        excerpt: post.excerpt,
        readingTime: `${post.reading_time} دقیقه`,
        url: `/blog-post?slug=${post.slug}`,
        image_url: post.image_url
      };
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
  return [];
  }
};

export function useBlogData() {
  const { siteConfig } = useDocusaurusContext();
  const API_BASE = siteConfig.customFields.apiUrl;
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBlogData = async () => {
      try {
        setLoading(true);
        const posts = await fetchBlogData(API_BASE as string);
        setBlogPosts(posts);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog posts');
        setBlogPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadBlogData();
  }, [API_BASE]);

  const categories = useMemo(() => {
    const categoryCounts: { [key: string]: number } = {};
    
    blogPosts.forEach(post => {
      categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
    });
    
    return Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count
    }));
  }, [blogPosts]);

  return {
    blogPosts,
    categories,
    loading,
    error
  };
} 