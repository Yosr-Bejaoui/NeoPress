import axios from 'axios';

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // If explicitly set in environment, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // In production (on Render), use relative path so it uses the same domain
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  
  // Development fallback
  return 'http://localhost:5001/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
});

// Log the configuration for debugging
console.log('[API CONFIG]', {
  baseURL: getApiBaseUrl(),
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      try { localStorage.removeItem('authToken'); } catch {}
      if (typeof window !== 'undefined') {
        const isLogin = window.location.pathname.toLowerCase().includes('login');
        if (!isLogin) {
          window.location.replace('/');
        }
      }
    }
    return Promise.reject(error);
  }
);


export const articleService = {
  getArticles: async (params = {}) => {
    try {
      const queryParams = {
        ...(params.status && params.status !== 'all' && { status: params.status }),
        ...(params.category && params.category !== 'All' && { category: params.category }),
        ...(params.region && params.region !== 'all' && { region: params.region }),
        ...(params.limit && { limit: params.limit }),
        ...(params.sort && { sort: params.sort })
      };
      
      const response = await api.get('/articles', { params: queryParams });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch articles');
    }
  },

  getArticleById: async (id) => {
    try {
      const response = await api.get(`/articles/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch article');
    }
  },

  getArticlesByRegion: async (region, params = {}) => {
    try {
      const response = await api.get(`/articles/region/${region}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch articles by region');
    }
  },

  createArticle: async (articleData) => {
    try {
      const response = await api.post('/articles', articleData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create article');
    }
  },

  updateArticle: async (id, articleData) => {
    try {
      console.log('🔄 Updating article:', { id, articleData });
      const response = await api.put(`/articles/${id}`, articleData);
      console.log('✅ Article update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error in updateArticle:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        errors: error.response?.data?.errors
      });
      
      // Extract detailed error message
      let errorMessage = 'Failed to update article';
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorDetails = error.response.data.errors.map(e => `${e.field}: ${e.message}`).join(', ');
        errorMessage = `Validation failed: ${errorDetails}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  deleteArticle: async (id) => {
    try {
      const response = await api.delete(`/articles/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error in deleteArticle:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to delete article');
    }
  },

  generateArticle: async (generationData) => {
    try {
      const response = await api.post('/articles/generate', generationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate article');
    }
  },

  regenerateArticle: async (id, regenerationData) => {
    try {
      const response = await api.put(`/articles/${id}/regenerate`, regenerationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to regenerate article');
    }
  },

  incrementViews: async (id) => {
    try {
      const response = await api.patch(`/articles/${id}/views`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to increment views');
    }
  },

  updateEngagement: async (id, type, value = 1) => {
    try {
      const response = await api.patch(`/articles/${id}/engagement`, { type, value });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update engagement');
    }
  },

  approveArticle: async (id) => {
    try {
      const response = await api.patch(`/articles/${id}/status`, { status: 'published' });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to approve article');
    }
  },

  rejectArticle: async (id) => {
    try {
      const response = await api.patch(`/articles/${id}/status`, { status: 'rejected' });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reject article');
    }
  }
};


export const newsService = {
  getTunisiaNews: async (limit = 100) => {
    try {
      const response = await api.get('/news', { params: { pageSize: limit } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch Tunisia news');
    }
  },

  getNewsByCategory: async (category, limit = 100) => {
    try {
      const response = await api.get(`/news/category/${category}`, { params: { pageSize: limit } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch category news');
    }
  },

  searchNews: async (searchParams) => {
    try {
      const response = await api.get('/news/search', { params: searchParams });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search news');
    }
  },

  getMenaNews: async (limit = 100) => {
    try {
      const response = await api.get('/news/mena', { params: { pageSize: limit } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch MENA news');
    }
  },

  getPopularNews: async () => {
    try {
      const response = await api.get('/news/popular');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch popular news');
    }
  },

  getWorldNews: async () => {
    try {
      const response = await api.get('/news/world');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch world news');
    }
  }
};


export const analyticsService = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  },

  getArticleAnalytics: async (articleId) => {
    try {
      const response = await api.get(`/analytics/articles/${articleId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch article analytics');
    }
  },

  getTrendingArticles: async (limit = 10) => {
    try {
      const response = await api.get('/analytics/trending', { params: { limit } });
      return response.data?.articles || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch trending articles');
    }
  },

  getCategoryAnalytics: async (category) => {
    try {
      const response = await api.get(`/analytics/category/${category}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch category analytics');
    }
  },

  getPerformanceOverTime: async (period = '7d') => {
    try {
      const response = await api.get('/analytics/performance', { params: { period } });
      const payload = response.data;
      if (Array.isArray(payload?.data)) {
        return payload.data.map((d) => Number(d?.views) || 0);
      }
      return payload;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch performance data');
    }
  }
};


export const searchService = {
  searchArticles: async (query, filters = {}) => {
    try {
      const response = await api.get('/articles/search', { 
        params: { q: query, ...filters } 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search articles');
    }
  },

  getArticlesByCategory: async (category) => {
    try {
      const response = await api.get('/articles/category', { params: { category } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch articles by category');
    }
  },

  getTrendingArticles: async (limit = 10) => {
    try {
      const response = await api.get('/analytics/trending', { params: { limit } });
      return response.data.articles || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch trending articles');
    }
  }
};


export const authService = {
  login: async (credentials) => {
    try {
      console.log('[AUTH SERVICE] Login attempt with:', {
        email: credentials.email,
        identifier: credentials.identifier,
        hasPassword: !!credentials.password
      });

      const identifier = credentials.email || credentials.username || credentials.identifier;
      const payload = {
        identifier,
        email: credentials.email ?? identifier,
        username: credentials.username ?? identifier,
        password: credentials.password
      };

      console.log('[AUTH SERVICE] Sending request to:', '/auth/login');
      const response = await api.post('/auth/login', payload);
      console.log('[AUTH SERVICE] Response received:', {
        status: response.status,
        hasData: !!response.data,
        hasToken: !!(response.data?.token || response.data?.data?.token || response.data?.accessToken)
      });

      const token = response.data?.token || response.data?.data?.token || response.data?.accessToken;
      const user = response.data?.user || response.data?.data?.user || null;

      if (token) {
        console.log('[AUTH SERVICE] Token received, storing in localStorage');
        try { 
          localStorage.setItem('authToken', token);
          console.log('[AUTH SERVICE] Token stored successfully');
        } catch (e) {
          console.error('[AUTH SERVICE] Failed to store token:', e);
        }
      } else {
        console.warn('[AUTH SERVICE] No token received in response');
      }

      return { token, user };
    } catch (error) {
      console.error('[AUTH SERVICE] Login failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  logout: () => {
    try { localStorage.removeItem('authToken'); } catch {}
  },

  me: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data?.user || response.data?.data?.user || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify session');
    }
  }
};

export default api;