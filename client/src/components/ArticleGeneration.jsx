import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Bot, Sparkles, ArrowLeft, Loader, RefreshCw, Image, ExternalLink, AlertCircle, CheckCircle, X } from 'lucide-react';
import { newsService, articleService } from '../services/api';



const NEWS_SOURCES = [
  { value: 'tunisia', label: 'Tunisia News' },
  { value: 'mena', label: 'MENA Region' },
  { value: 'politics', label: 'Politics' },
  { value: 'tech', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'health', label: 'Health' },
  { value: 'sports', label: 'Sports' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'science', label: 'Science' },
  { value: 'education', label: 'Education' },
  { value: 'environment', label: 'Environment' }
];

const CATEGORIES = [
  { value: 'Politics', label: 'Politics' },
  { value: 'Business & Finance', label: 'Business & Finance' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Health & Wellness', label: 'Health & Wellness' },
  { value: 'Science', label: 'Science' },
  { value: 'Education', label: 'Education' },
  { value: 'Environment', label: 'Environment' },
  { value: 'Culture & Arts', label: 'Culture & Arts' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Food & Dining', label: 'Food & Dining' },
  { value: 'Fashion & Style', label: 'Fashion & Style' },
  { value: 'Lifestyle', label: 'Lifestyle' }
];

const REGIONS = [
  { value: 'Local', label: 'Local' },
  { value: 'National', label: 'National' },
  { value: 'MENA', label: 'MENA' },
  { value: 'Africa', label: 'Africa' },
  { value: 'Europe', label: 'Europe' },
  { value: 'Asia', label: 'Asia' },
  { value: 'North America', label: 'North America' },
  { value: 'South America', label: 'South America' },
  { value: 'Australia & Oceania', label: 'Australia & Oceania' },
  { value: 'International', label: 'International' }
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
  { value: 'fr', label: 'French' }
];

const TONES = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'analytical', label: 'Analytical' },
  { value: 'engaging', label: 'Engaging' }
];

const ArticleGeneration = ({ onBack, onArticleGenerated }) => {
  const [formData, setFormData] = useState({
    newsSource: 'general',
    category: 'Politics',
    region: 'International',
    language: 'en',
    tone: 'neutral'
  });

  const [uiState, setUiState] = useState({
    selectedNews: null,
    selectedNewsList: [],
    showNewsPopup: false,
    popupNews: null,
    validationErrors: {}
  });

  const [newsState, setNewsState] = useState({
    news: [],
    loading: false,
    error: null,
    lastFetched: null
  });

  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const generateArticle = useCallback(async (data) => {
    setGenerating(true);
    setError(null);
    setProgress(0);
    setSuccess(false);

    try {
      console.log('Generating article with data:', {
        title: data.title,
        category: data.category,
        region: data.region,
        language: data.language,
        tone: data.tone,
        hasSummary: !!data.summary
      });

      if (!data.title || !data.category) {
        throw new Error('Title and category are required');
      }

      if (!data.region) {
        throw new Error('Region is required');
      }
      
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 95));
      }, 300);

      const result = await articleService.generateArticle(data);
      console.log('✅ Article generated successfully:', result);
      
      clearInterval(interval);
      setProgress(100);
      setGenerating(false);
      setSuccess(true);
    
      setTimeout(() => {
        setSuccess(false);
        setProgress(0);
      }, 3000);
      
      return result;
    } catch (err) {
      console.error('❌ Article generation error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        data: err.response?.data
      });
      
      let errorMessage = err.message || 'Failed to generate article. Please try again.';
      
      // Extract more specific error from response
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
      setGenerating(false);
      setProgress(0);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSuccess = useCallback(() => {
    setSuccess(false);
    setProgress(0);
  }, []);

  const fetchNews = useCallback(async (sourceType, forceFetch = false) => {
    setNewsState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const limit = 50; // Reduced from 100
      let allArticles = [];
      
      console.log('Fetching news from selected sources...');
      
      // Only fetch from 3-4 sources instead of 10
      const fetchPromises = [
        newsService.getPopularNews().catch(err => {
          console.error('Popular news error:', err);
          return { articles: [] };
        }),
        newsService.getWorldNews().catch(err => {
          console.error('World news error:', err);
          return { articles: [] };
        }),
        newsService.getTunisiaNews(limit).catch(err => {
          console.error('Tunisia news error:', err);
          return { articles: [] };
        })
      ];
      
      const results = await Promise.all(fetchPromises);
      
      results.forEach(newsData => {
        let articles = Array.isArray(newsData) ? newsData : 
                      Array.isArray(newsData?.data) ? newsData.data :
                      Array.isArray(newsData?.articles) ? newsData.articles : [];
        allArticles = allArticles.concat(articles);
      });
      
      const seen = new Set();
      const uniqueArticles = allArticles.filter(article => {
        if (!article || !article.title) return false;
        const normalizedTitle = article.title.toLowerCase().trim();
        if (seen.has(normalizedTitle)) return false;
        seen.add(normalizedTitle);
        return true;
      });
      
      const filteredArticles = uniqueArticles.filter(article => 
        article.title && 
        article.title.length > 10 &&
        (article.description || article.summary)
      );
      
      filteredArticles.sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.createdAt || 0);
        const dateB = new Date(b.publishedAt || b.createdAt || 0);
        return dateB - dateA;
      });
      
      console.log(`✅ Fetched ${filteredArticles.length} unique articles from all sources`);
      
      setNewsState(prev => ({ 
        ...prev, 
        news: filteredArticles, 
        loading: false, 
        error: null,
        lastFetched: new Date()
      }));
      
    } catch (err) {      
      console.error('News fetch error:', err);
      setNewsState(prev => ({ 
        ...prev, 
        loading: false, 
        error: err.message || `Failed to fetch news from all sources`,
        news: prev.news 
      }));
    }
  }, []);

  useEffect(() => {
    if (formData.newsSource) {
      const timeoutId = setTimeout(() => {
        fetchNews(formData.newsSource);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData.newsSource, fetchNews]);

  const retryNews = useCallback(() => {
    if (formData.newsSource) {
      fetchNews(formData.newsSource, true);
    }
  }, [formData.newsSource]);

  const { news, loading: newsLoading, error: newsError, lastFetched } = newsState;
  const displayNews = useMemo(() => {
    console.log('Displaying news:', {
      totalArticles: news.length,
      category: formData.category,
      region: formData.region
    });
    return news;
  }, [news]);
  const newsSources = NEWS_SOURCES;

  const validateForm = useCallback(() => {
    const errors = {};
    
    if (uiState.selectedNewsList.length === 0) {
      errors.news = 'Please select at least one news article';
    }
    
    setUiState(prev => ({ ...prev, validationErrors: errors }));
    return Object.keys(errors).length === 0;
  }, [uiState.selectedNewsList.length]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    console.log(`Form input changed: ${name} = ${value}`);
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      console.log('New form data:', newData);
      return newData;
    });
    
    if (name === 'newsSource' || name === 'category' || name === 'region') {
      console.log(`${name} changed, clearing selection`);
      setUiState(prev => ({ 
        ...prev, 
        selectedNews: null,
        selectedNewsList: [],
        validationErrors: { ...prev.validationErrors, [name]: undefined }
      }));
      
      if (name === 'category' || name === 'newsSource' || name === 'region') {
        const sourceToUse = name === 'newsSource' ? value : formData.newsSource;
        fetchNews(sourceToUse);
      }
    }
  }, [fetchNews, formData.newsSource]);

  const isNewsSelected = useCallback((newsItem) => {
    return uiState.selectedNewsList.some(item => item.title === newsItem.title);
  }, [uiState.selectedNewsList]);

  const toggleNewsSelection = useCallback((newsItem) => {
    setUiState(prev => {
      const exists = prev.selectedNewsList.some(item => item.title === newsItem.title);
      const updated = exists
        ? prev.selectedNewsList.filter(item => item.title !== newsItem.title)
        : [...prev.selectedNewsList, newsItem];
      return { ...prev, selectedNewsList: updated, validationErrors: { ...prev.validationErrors, news: undefined } };
    });
  }, []);

  const selectAllNews = useCallback(() => {
    const maxSelection = 100; 
    const currentSelected = new Set(uiState.selectedNewsList.map(item => item.title));
    const newArticles = displayNews
      .filter(item => !currentSelected.has(item.title))
      .slice(0, maxSelection - currentSelected.size);

    setUiState(prev => ({ 
      ...prev, 
      selectedNewsList: [...prev.selectedNewsList, ...newArticles],
      validationErrors: {
        ...prev.validationErrors,
        selection: newArticles.length === 0 
          ? "All available articles are already selected" 
          : undefined
      }
    }));
  }, [displayNews, uiState.selectedNewsList]);

  const clearSelection = useCallback(() => {
    setUiState(prev => ({ ...prev, selectedNewsList: [] }));
  }, []);

  const handleNewsSelect = useCallback((newsItem) => {
    setUiState(prev => ({
      ...prev,
      popupNews: newsItem,
      showNewsPopup: true
    }));
  }, []);

  const handleSelectFromPopup = useCallback(() => {
    setUiState(prev => {
      const isAlreadySelected = prev.selectedNewsList.some(
        item => item.title === prev.popupNews.title
      );
      
      const updatedList = isAlreadySelected
        ? prev.selectedNewsList
        : [...prev.selectedNewsList, prev.popupNews];

      return {
        ...prev,
        selectedNews: prev.popupNews,
        selectedNewsList: updatedList,
        showNewsPopup: false,
        validationErrors: { ...prev.validationErrors, news: undefined }
      };
    });
  }, []);

  const handleDeleteNews = useCallback(() => {
    if (uiState.popupNews) {
      const updatedNews = newsState.news.filter(item => item.title !== uiState.popupNews.title);
      setNewsState(prev => ({ ...prev, news: updatedNews }));
      
      if (uiState.selectedNews?.title === uiState.popupNews.title) {
        setUiState(prev => ({ 
          ...prev, 
          selectedNews: null,
          validationErrors: { ...prev.validationErrors, news: 'Please select another news article' }
        }));
      }
      
      setUiState(prev => ({
        ...prev,
        showNewsPopup: false,
        popupNews: null
      }));
    }
  }, [uiState.popupNews, uiState.selectedNews, newsState.news]);

  const handleClosePopup = useCallback(() => {
    setUiState(prev => ({
      ...prev,
      showNewsPopup: false,
      popupNews: null
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      newsSource: 'general',
      category: 'Politics',
      region: 'International',
      language: 'en',
      tone: 'neutral'
    });
    setUiState({
      selectedNews: null,
      selectedNewsList: [],
      showNewsPopup: false,
      popupNews: null,
      validationErrors: {}
    });
  }, []);

  const handleSubmit = useCallback(async (e, refreshCallback) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setGenerating(true);
    setError(null);
    setProgress(0);
    setSuccess(false);

    try {
      const successfulArticles = new Set();
      const failedArticles = new Set();
      const generatedArticlesList = [];
      
      const totalArticles = uiState.selectedNewsList.length;
      let completedCount = 0;
      
      for (const newsItem of uiState.selectedNewsList) {
        const generationData = {
          title: newsItem.title,
          summary: newsItem.description || newsItem.summary,
          category: formData.category,
          region: formData.region,
          language: formData.language,
          tone: formData.tone,
          sourceImage: newsItem.urlToImage || newsItem.imageUrl,
          sourceUrl: newsItem.url || newsItem.link,
          publishedAt: newsItem.publishedAt || newsItem.createdAt,
          sourceName: newsItem.source?.name || newsItem.sourceName
        };

        try {
          console.log(`Generating article ${completedCount + 1}/${totalArticles}:`, newsItem.title);
          
          const response = await articleService.generateArticle(generationData);
          
          completedCount++;
          setProgress(Math.round((completedCount / totalArticles) * 100));
          
          const article = response?.article || response;
          if (article) {
            generatedArticlesList.push(article);
            successfulArticles.add(newsItem.title);
            console.log(`✅ Article ${completedCount}/${totalArticles} generated successfully`);
          }
        } catch (error) {
          console.error(`Failed to generate article for "${newsItem.title}":`, error);
          failedArticles.add(newsItem.title);
          completedCount++;
          setProgress(Math.round((completedCount / totalArticles) * 100));
        }
      }

      setGenerating(false);
      
      if (onArticleGenerated && generatedArticlesList.length > 0) {
        onArticleGenerated(generatedArticlesList[generatedArticlesList.length - 1]);
      }
      
      if (successfulArticles.size > 0) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setProgress(0);
        }, 3000);
      }

      setUiState(prev => ({
        ...prev,
        selectedNewsList: prev.selectedNewsList.filter(item => 
          !successfulArticles.has(item.title)
        ),
        validationErrors: failedArticles.size > 0 ? {
          ...prev.validationErrors,
          generation: `Generated ${successfulArticles.size} article(s). Failed ${failedArticles.size} article(s).`
        } : prev.validationErrors
      }));
      
    } catch (err) {
      console.error('Generation error:', err);
      setGenerating(false);
      setError(err.message || 'Failed to generate articles');
    }
  }, [validateForm, uiState.selectedNewsList, formData, onArticleGenerated]);

  useEffect(() => {
    if (success && (uiState.selectedNews || Object.keys(uiState.validationErrors).length > 0)) {
      clearSuccess();
    }
  }, [success, uiState.selectedNews, uiState.validationErrors, clearSuccess]);

  useEffect(() => {
    // Only fetch if we don't have news or if it's been more than 5 minutes
    const shouldFetch = !newsState.news.length || 
      !newsState.lastFetched || 
      (Date.now() - newsState.lastFetched.getTime() > 5 * 60 * 1000);
    
    if (formData.newsSource && shouldFetch) {
      const timeoutId = setTimeout(() => {
        fetchNews(formData.newsSource);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData.newsSource, fetchNews, newsState.news.length, newsState.lastFetched]);

const formatDate = (date) => {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString();
  } catch (e) {
    return '';
  }
};

return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 bg-gray-50">
      <header className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bot className="text-blue-600" size={32} />
              AI Article Generator
            </h1>
            <p className="text-gray-600 mt-2">Transform news stories into engaging articles with AI</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="text-blue-600 font-semibold">{displayNews.length}</div>
            <div className="text-sm text-blue-700">Available Stories</div>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <div className="text-green-600 font-semibold">{uiState.selectedNewsList.length}</div>
            <div className="text-sm text-green-700">Selected Articles</div>
          </div>
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <div className="text-purple-600 font-semibold">{generating ? "Generating..." : "Ready"}</div>
            <div className="text-sm text-purple-700">Status</div>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Article Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {uiState.validationErrors.category && (
              <p className="text-xs text-red-600 mt-1">{uiState.validationErrors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
              Region *
            </label>
            <select
              id="region"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {REGIONS.map(reg => (
                <option key={reg.value} value={reg.value}>{reg.label}</option>
              ))}
            </select>
            {uiState.validationErrors.region && (
              <p className="text-xs text-red-600 mt-1">{uiState.validationErrors.region}</p>
            )}
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
              Tone
            </label>
            <select
              id="tone"
              name="tone"
              value={formData.tone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {TONES.map(tone => (
                <option key={tone.value} value={tone.value}>{tone.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} />
            <h3 className="text-green-800 font-medium">Article Generated Successfully!</h3>
          </div>
          <p className="text-green-700 text-sm mt-1">Your article has been created and saved.</p>
        </div>
      )}

      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-red-500 mt-0.5" size={20} />
              <div>
                <h3 className="text-red-800 font-medium">Generation Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                {error.includes('API key') && (
                  <p className="text-red-600 text-xs mt-2">
                    Please check your environment configuration. The Gemini API key may be missing.
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600 transition-colors"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Main Content Area */}
        <div className="space-y-6">


   
          {/* News Selection Panel */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">News Stories</h3>
                {lastFetched && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Updated: {lastFetched.toLocaleTimeString()}
                  </span>
                )}
                {newsLoading && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                    <RefreshCw className="animate-spin" size={12} />
                    Refreshing...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {news.length > 0 && (
                  <>
                    <button 
                      onClick={selectAllNews} 
                      className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <Sparkles size={14} />
                      Select All
                    </button>
                    <button 
                      onClick={clearSelection} 
                      className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    >
                      Clear
                    </button>
                  </>
                )}
                <button 
                  onClick={retryNews} 
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  Refresh
                </button>
              </div>
            </div>

            {newsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="text-red-500" size={16} />
                    <p className="text-sm text-red-700">Error loading news: {newsError}</p>
                  </div>
                  <button
                    onClick={retryNews}
                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                  >
                    <RefreshCw size={14} />
                    Retry
                  </button>
                </div>
                <div className="mt-2 text-xs text-red-600">
                  <p><strong>Troubleshooting:</strong></p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Ensure your backend server is running</li>
                    <li>Check NEWS_API_KEY in your backend .env file</li>
                    <li>Verify REACT_APP_API_URL in your frontend environment</li>
                    <li>Check browser console for detailed error logs</li>
                  </ul>
                </div>
              </div>
            )}

            {uiState.validationErrors.news && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-yellow-600" size={16} />
                  <p className="text-sm text-yellow-800">{uiState.validationErrors.news}</p>
                </div>
              </div>
            )}

            {uiState.selectedNewsList.length > 0 && (
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-900">Selected Articles: {uiState.selectedNewsList.length}</p>
                  <button
                    onClick={() => setUiState(prev => ({ ...prev, selectedNewsList: [] }))}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {uiState.selectedNewsList.map((article, index) => (
                    <div key={`${article.title}-${index}`} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        {(article.urlToImage || article.imageUrl) && (
                          <img 
                            src={article.urlToImage || article.imageUrl} 
                            alt="Selected news"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-blue-900 text-sm line-clamp-1">{article.title}</h4>
                          <p className="text-sm text-blue-700 mt-1 line-clamp-2">
                            {article.description || article.summary}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setUiState(prev => ({
                              ...prev,
                              selectedNewsList: prev.selectedNewsList.filter((_, i) => i !== index)
                            }));
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          aria-label="Remove article"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto space-y-3">
              {displayNews.length > 0 ? (
                displayNews.map((newsItem, index) => (
                  <div
                    key={`${newsItem.title}-${index}`}
                    onClick={() => handleNewsSelect(newsItem)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      isNewsSelected(newsItem)
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                    } ${index === 0 ? 'border-l-4 border-l-blue-500' : ''}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNewsSelect(newsItem);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isNewsSelected(newsItem)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleNewsSelection(newsItem);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded"
                      />
                      {(newsItem.urlToImage || newsItem.imageUrl) && (
                        <img 
                          src={newsItem.urlToImage || newsItem.imageUrl} 
                          alt="News thumbnail"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 line-clamp-2">
                          {newsItem.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {newsItem.description || newsItem.summary}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>{newsItem.source?.name || newsItem.sourceName || 'Unknown Source'}</span>
                          <span>•</span>
                          <span>{new Date(newsItem.publishedAt || newsItem.createdAt).toLocaleDateString()}</span>
                          {(newsItem.url || newsItem.link) && (
                            <a 
                              href={newsItem.url || newsItem.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink size={12} />
                              View
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                !newsLoading && (
                  <div className="text-center py-8 text-gray-500">
                    <Image size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No news articles match your filters</p>
                    <p className="text-xs mt-1">Check your backend connection and API setup</p>
                    <button 
                      onClick={retryNews}
                      className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                )
              )}
            </div>
          </div>

        
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Generation Progress</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{generating ? 'Generating articles...' : 'Ready to generate'}</span>
                    {generating && <span>{progress}%</span>}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        generating ? 'bg-blue-600' : 'bg-green-600'
                      }`}
                      style={{ width: generating ? `${progress}%` : '100%' }}
                    />
                  </div>
                </div>
                {!generating && uiState.selectedNewsList.length > 0 && (
                  <div className="bg-blue-50 px-4 py-2 rounded-lg">
                    <span className="text-blue-700 font-medium">{uiState.selectedNewsList.length}</span>
                    <span className="text-blue-600 text-sm ml-1">articles selected</span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-500 mt-1" size={20} />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800 mb-1">
                      Generation Error
                    </h3>
                    <p className="text-sm text-red-700">{error}</p>
                    <button
                      onClick={clearError}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                onClick={handleSubmit}
                disabled={generating || uiState.selectedNewsList.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generating ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    Generating... {progress}%
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate {uiState.selectedNewsList.length > 0 ? `${uiState.selectedNewsList.length} ` : ''}Article{uiState.selectedNewsList.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
              
              <button
                onClick={resetForm}
                disabled={generating}
                className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {uiState.showNewsPopup && uiState.popupNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      {uiState.popupNews.source?.name || uiState.popupNews.sourceName || 'News Story'}
                    </span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      {new Date(uiState.popupNews.publishedAt || uiState.popupNews.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {uiState.popupNews.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Preview and select this story for AI article generation
                  </p>
                </div>
                <button
                  onClick={handleClosePopup}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                  aria-label="Close popup"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

        
            <div className="p-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                  {(uiState.popupNews.urlToImage || uiState.popupNews.imageUrl) ? (
                    <img 
                      src={uiState.popupNews.urlToImage || uiState.popupNews.imageUrl} 
                      alt="News thumbnail"
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <Image className="text-gray-400" size={48} />
                    </div>
                  )}
                  
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {uiState.popupNews.description || uiState.popupNews.summary}
                    </p>
                  </div>
                  
                  {(uiState.popupNews.url || uiState.popupNews.link) && (
                    <a 
                      href={uiState.popupNews.url || uiState.popupNews.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink size={16} />
                      Read Original Article
                    </a>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Article Details</h4>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-500">Source</dt>
                        <dd className="font-medium text-gray-900">
                          {uiState.popupNews.source?.name || uiState.popupNews.sourceName || 'Unknown Source'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Published</dt>
                        <dd className="font-medium text-gray-900">
                          {new Date(uiState.popupNews.publishedAt || uiState.popupNews.createdAt).toLocaleDateString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Category</dt>
                        <dd className="font-medium text-gray-900">
                          {formData.category}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Region</dt>
                        <dd className="font-medium text-gray-900">
                          {formData.region}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

           
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={handleDeleteNews}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove Story
                  </button>
                  
                  <button
                    onClick={handleSelectFromPopup}
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1"
                  >
                    <Sparkles size={16} />
                    Generate Article
                  </button>
                </div>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Select this story to generate an AI-powered article with your current settings
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleGeneration;