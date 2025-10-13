
import { useState, useEffect, useCallback } from 'react';
import { articleService, analyticsService, newsService } from '../services/api';


export const useArticles = (filters = {}) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await articleService.getArticles(filters);
      setArticles(Array.isArray(data) ? data : data.articles || []);
    } catch (err) {
      setError(err.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [JSON.stringify(filters)]);

  const refetch = useCallback(() => {
    fetchArticles();
  }, []);

  return { articles, loading, error, refetch };
};


export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedToday: 0,
    pendingReview: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await analyticsService.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};


export const useNews = (type = 'tunisia', category = null) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      switch (type) {
        case 'category':
          if (!category) {
            throw new Error('Category is required for category-based news');
          }
          data = await newsService.getNewsByCategory(category);
          break;
        case 'mena':
          data = await newsService.getMenaNews();
          break;
        case 'search':
          if (!category) { 
            throw new Error('Search query is required');
          }
          data = await newsService.searchNews({ q: category });
          break;
        default:
          data = await newsService.getTunisiaNews();
      }
      
      const filteredArticles = (data.articles || []).filter(article => 
        article.title && 
        article.title.trim() !== '' &&
        article.title !== '[Removed]' &&
        article.description &&
        article.description.trim() !== ''
      );
      
      setNews(filteredArticles);
      setLastFetch(new Date());
    } catch (err) {
      setError(err.message);
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [type, category]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const refetch = useCallback(() => {
    fetchNews();
  }, [fetchNews]);

  return { news, loading, error, refetch, lastFetch };
};

export const useArticleGeneration = () => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);

  const generateArticle = async (generationData) => {
    try {
      setGenerating(true);
      setError(null);
      setProgress('Analyzing news content...');
      
      if (!generationData.title) {
        throw new Error('News title is required');
      }
      
      if (!generationData.category) {
        throw new Error('Category is required');
      }

      setProgress('Generating article content...');
      
      const result = await articleService.generateArticle({
        title: generationData.title,
        summary: generationData.summary || generationData.description,
        category: generationData.category,
        language: generationData.language || 'en',
        tone: generationData.tone || 'neutral',
        sourceImage: generationData.sourceImage || generationData.urlToImage,
        sourceUrl: generationData.sourceUrl || generationData.url,
        publishedAt: generationData.publishedAt,
        sourceName: generationData.sourceName || generationData.source?.name
      });

      setProgress('Article generated successfully!');
      
      setTimeout(() => setProgress(null), 2000);
      
      return result;
    } catch (err) {
      setError(err.message);
      setProgress(null);
      throw err;
    } finally {
      setGenerating(false);
    }
  };

  const regenerateArticle = async (id, regenerationData) => {
    try {
      setGenerating(true);
      setError(null);
      setProgress('Regenerating article...');
      
      const result = await articleService.regenerateArticle(id, regenerationData);
      
      setProgress('Article regenerated successfully!');
      setTimeout(() => setProgress(null), 2000);
      
      return result;
    } catch (err) {
      setError(err.message);
      setProgress(null);
      throw err;
    } finally {
      setGenerating(false);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generateArticle,
    regenerateArticle,
    generating,
    error,
    progress,
    clearError
  };
};

export const useArticleOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateArticle = async (id, articleData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await articleService.updateArticle(id, articleData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const result = await articleService.deleteArticle(id);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveArticle = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const result = await articleService.updateArticle(id, { 
        status: 'published',
        approvedBy: {
          name: 'Current User', 
          approvedAt: new Date()
        }
      });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectArticle = async (id, reason = '') => {
    try {
      setLoading(true);
      setError(null);
      const result = await articleService.updateArticle(id, { 
        status: 'rejected',
        rejectionReason: reason
      });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateArticle,
    deleteArticle,
    approveArticle,
    rejectArticle,
    loading,
    error
  };
};


export const useNewsCategories = () => {
  const [categories] = useState([
    { value: 'business', label: 'Business', icon: '💼' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'general', label: 'General', icon: '📰' },
    { value: 'health', label: 'Health', icon: '🏥' },
    { value: 'science', label: 'Science', icon: '🔬' },
    { value: 'sports', label: 'Sports', icon: '⚽' },
    { value: 'technology', label: 'Technology', icon: '💻' }
  ]);

  const [newsSources] = useState([
    { value: 'tunisia', label: 'Tunisia News', description: 'Latest news from Tunisia' },
    { value: 'mena', label: 'MENA Region', description: 'Middle East and North Africa news' },
    { value: 'category', label: 'By Category', description: 'Browse by news category' }
  ]);

  return { categories, newsSources };
};


export const useArticleAnalytics = (articleId) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!articleId) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await analyticsService.getArticleAnalytics(articleId);
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [articleId]);

  return { analytics, loading, error };
};