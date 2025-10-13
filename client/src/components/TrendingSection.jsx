import React from 'react';
import { TrendingUp, Clock, Calendar, Eye } from 'lucide-react';

const TrendingSection = ({ trendingArticle, loading, onArticleClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getReadTime = (content) => {
    if (!content) return '5 min read';
    const words = content.split(' ').length;
    const readTime = Math.ceil(words / 200);
    return `${readTime} min read`;
  };

  const formatViews = (views) => {
    if (!views) return '0';
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views.toLocaleString();
  };

  const handleClick = () => {
    if (trendingArticle) {
      if (trendingArticle.isNews) {
        window.open(trendingArticle.url || trendingArticle.link, '_blank');
      } else if (onArticleClick) {
        onArticleClick(trendingArticle);
      }
    }
  };

  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex items-center mb-6">
          <div className="w-1 h-6 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!trendingArticle) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center mb-6">
        <div className="w-1 h-6 bg-gray-900 rounded-full mr-3"></div>
        <h2 className="text-xl font-semibold text-gray-900">Trending</h2>
      </div>
      
      <div 
        className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
        onClick={handleClick}
      >
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex items-center space-x-3 mb-3">
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>{trendingArticle.category || 'Trending'}</span>
              </span>
              {trendingArticle.region && (
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                  {trendingArticle.region}
                </span>
              )}
              {trendingArticle.isNews && (
                <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Live
                </span>
              )}
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
            {trendingArticle.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {trendingArticle.summary || 
             trendingArticle.description || 
             trendingArticle.content?.substring(0, 200) + '...'}
          </p>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {getReadTime(trendingArticle.content)}
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(trendingArticle.createdAt || trendingArticle.publishedAt)}
            </span>
            {trendingArticle.views && (
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {formatViews(trendingArticle.views)} views
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;