import React, { useState, useEffect, useCallback, useRef } from 'react';

import Header from '../components/MainHeader';
import HeroSection from '../components/HeroSection';
import TrendingSection from '../components/TrendingSection';
import ArticleCard from '../components/MainArticleCard';
import { ArticleCardSkeleton } from '../components/LoadingSkeleton';
import Footer from '../components/Footer';
import ArticlePopup from '../components/ArticlePopup';
import { articleService, searchService } from '../services/api';


const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const MainView = () => {
  const [allArticles, setAllArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [trendingArticle, setTrendingArticle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [visibleCount, setVisibleCount] = useState(9);
  const pageSize = 12;  
  const loadMoreRef = useRef(null);
  

  
 
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

 
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const category = params.get('category') || 'all';
    const region = params.get('region') || 'all';
    setSearchQuery(q);
    setSelectedCategory(category);
    setSelectedRegion(region);
  }, []);



 
  const mapRegionToBackend = (region) => {
    const regionMap = {
      'local': 'Local',
      'national': 'National',
      'mena': 'MENA',
      'europe': 'Europe',
      'asia': 'Asia',
      'africa': 'Africa',
      'north-america': 'North America',
      'south-america': 'South America',
      'australia': 'Australia & Oceania',
      'international': 'International'
    };
    return regionMap[region] || 'International';
  };

  const mapCategoryToBackend = (category) => {
    const categoryMap = {
      'tech': 'Technology',
      'health': 'Health & Wellness',
      'business': 'Business & Finance',
      'politics': 'Politics',
      'sports': 'Sports',
      'entertainment': 'Entertainment',
      'science': 'Science',
      'education': 'Education',
      'environment': 'Environment',
      'culture': 'Culture & Arts',
      'travel': 'Travel',
      'food': 'Food & Dining',
      'fashion': 'Fashion & Style',
      'automotive': 'Automotive',
      'real-estate': 'Real Estate',
      'lifestyle': 'Lifestyle',
      'opinion': 'Opinion & Analysis'
    };
    return categoryMap[category] || category;
  };


  const debouncedSearch = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm || searchTerm.trim().length < 2) {
        
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const searchResults = await searchService.searchArticles(searchTerm, {
          category: selectedCategory !== 'All' ? mapCategoryToBackend(selectedCategory) : undefined,
          region: selectedRegion !== 'all' ? mapRegionToBackend(selectedRegion) : undefined,
          status: 'published'
        });
        
        const articles = searchResults.articles || searchResults.data || searchResults;
        if (Array.isArray(articles)) {
          setAllArticles(articles);
          setFilteredArticles(articles);
          
          
          if (articles.length > 0) {
            const trending = articles.reduce((prev, current) => 
              (prev.views || 0) > (current.views || 0) ? prev : current
            );
            setTrendingArticle(trending);
          }
        } else {
          throw new Error('Invalid search results format');
        }
      } catch (err) {
        console.error('Search error:', err);
        setError(err.message || 'Failed to perform search. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 300), 
    [selectedCategory, selectedRegion]
  );

 
  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (searchQuery && searchQuery.trim().length >= 2) {
          debouncedSearch(searchQuery);
          return;
        }
        
        const response = await articleService.getArticles({ 
          status: 'published',
          sort: '-createdAt',
          category: (selectedCategory !== 'All' && selectedCategory !== 'all') ? mapCategoryToBackend(selectedCategory) : undefined,
          region: selectedRegion !== 'all' ? mapRegionToBackend(selectedRegion) : undefined
        });
        
        const articles = response.articles || response.data || response;
        
        if (Array.isArray(articles)) {
          setAllArticles(articles);
          setFilteredArticles(articles);
          
          
          const trending = articles.length > 0 ? 
            articles.reduce((prev, current) => 
              (prev.views || 0) > (current.views || 0) ? prev : current
            ) : null;
          setTrendingArticle(trending);
          
         
        } else {
          setError('Invalid data received from server');
        }
        
      } catch (err) {
        setError(err.message || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [selectedCategory, selectedRegion, searchQuery, debouncedSearch]);

  
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedRegion && selectedRegion !== 'all') params.set('region', selectedRegion);
    const queryString = params.toString();
    const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
    window.history.replaceState(null, '', newUrl);
  }, [searchQuery, selectedCategory, selectedRegion]);



  const filterArticles = useCallback((articles, searchTerm, category, region) => {
    let filtered = articles;
    
    if (category && category !== 'All' && category !== 'all') {
      const backendCategory = mapCategoryToBackend(category);
      filtered = filtered.filter(article => 
        article.category && article.category === backendCategory
      );
    }
    
    if (region && region !== 'all') {
      const backendRegion = mapRegionToBackend(region);
      filtered = filtered.filter(article => 
        article.region && article.region === backendRegion
      );
    }
    
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(article => 
        (article.title && article.title.toLowerCase().includes(term)) ||
        (article.content && article.content.toLowerCase().includes(term)) ||
        (article.summary && article.summary.toLowerCase().includes(term)) ||
        (article.category && article.category.toLowerCase().includes(term)) ||
        (article.region && article.region.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }, []);

  useEffect(() => {
    const filtered = filterArticles(allArticles, searchQuery, selectedCategory, selectedRegion);
    setFilteredArticles(filtered);
    setVisibleCount(pageSize); 
    
    if (filtered.length > 0) {
      const trending = filtered.reduce((prev, current) => 
        (prev.views || 0) > (current.views || 0) ? prev : current
      );
      setTrendingArticle(trending);
    } else {
      setTrendingArticle(null);
    }
  }, [searchQuery, selectedCategory, selectedRegion, allArticles, filterArticles, pageSize]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    
    const totalArticles = filteredArticles.length > 0 ? filteredArticles.length - 1 : 0;
    
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && visibleCount < totalArticles) {
        setVisibleCount((prev) => {
          const newCount = prev + pageSize;
          return Math.min(newCount, totalArticles);
        });
      }
    }, { rootMargin: '200px' });
    
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filteredArticles.length, pageSize]);

  const handleSearch = (query, regionLabel) => {
    setSearchQuery(query || '');
    
    if (regionLabel) {
      const map = {
        'All Regions': 'all',
        'Local': 'local',
        'International': 'international'
      };
      const mapped = map[regionLabel] || 'all';
      setSelectedRegion(mapped);
    }
  };

  const formatViews = (views) => {
    if (!views) return '0';
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views.toLocaleString();
  };

  const openArticle = (article) => {
    if (!article) {
      return;
    }

    setSelectedArticle(article);
    setIsPopupOpen(true);
  };

  const closeArticle = () => {
    setIsPopupOpen(false);
    setSelectedArticle(null);
  };

  const navigateToArticle = (article) => {
    if (!article) return;
    setSelectedArticle(article);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const gridArticles = filteredArticles.slice(1);
  const displayArticles = gridArticles.slice(0, visibleCount);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Articles</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={handleRetry} 
              className="bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
     
      
        <HeroSection onSearch={handleSearch} />
       

        <div className="max-w-5xl mx-auto px-6 py-8">
          
      
          <TrendingSection 
            trendingArticle={trendingArticle}
            loading={loading}
            onArticleClick={openArticle}
          />



          {featuredArticle && !loading && (
            <section className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-1 h-6 bg-gray-900 rounded-full mr-3"></div>
                <h2 className="text-xl font-semibold text-gray-900">Featured</h2>
              </div>
              
              <div onClick={() => openArticle(featuredArticle)}>
                <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                  <div className="flex">
                    <div className="w-1/3 aspect-[4/3]">
                      <img
                        src={featuredArticle.image || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop`}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop';
                        }}
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {featuredArticle.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(featuredArticle.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                        {featuredArticle.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {featuredArticle.summary || featuredArticle.content?.substring(0, 150) + '...'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatViews(featuredArticle.views)} views</span>
                        <span>5 min read</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

      
          <section>
            <div className="flex items-center mb-8">
              <div className="w-1 h-6 bg-gray-900 rounded-full mr-3"></div>
              <h2 className="text-xl font-semibold text-gray-900">Latest Articles</h2>
            </div>

     
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }, (_, index) => (
                  <ArticleCardSkeleton key={index} />
                ))
              ) : (
                displayArticles.map((article, index) => (
                  <div key={article.id || article._id?.$oid || article._id || `article-${index}`}>
                    <ArticleCard 
                      article={article}
                      featured={false}
                      compact={false}
                      onArticleClick={openArticle}
                    />
                  </div>
                ))
              )}
            </div>

            {!loading && visibleCount < gridArticles.length && (
              <div ref={loadMoreRef} className="text-center mt-8 py-8">
                <div className="inline-flex items-center space-x-2 text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  <span className="text-sm font-medium">Loading more articles...</span>
                </div>
              </div>
            )}

         
            {!loading && filteredArticles.length === 0 && (
              <div className="text-center py-16">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or explore different categories
                </p>
                                 <button
                   onClick={() => {
                     setSelectedCategory('All');
                     setSelectedRegion('all');
                     setSearchQuery('');
                   }}
                   className="bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors"
                 >
                   Reset Filters
                 </button>
              </div>
            )}
          </section>
        </div>

    
        <Footer/>
      </div>


      {isPopupOpen && selectedArticle && (
        <ArticlePopup
          article={selectedArticle}
          onClose={closeArticle}
          onNavigate={navigateToArticle}
          allArticles={allArticles}
          isOpen={isPopupOpen}
        />
      )}

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-800 transition-colors"
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </>
  );
};

export default MainView;
