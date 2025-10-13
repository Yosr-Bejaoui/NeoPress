import React, { useState } from 'react';
import { Clock, Eye, Share2, ChevronRight } from 'lucide-react';

const ArticleCard = ({ article, featured = false, compact = false, onArticleClick }) => {
  const handleArticleClick = () => {
    if (onArticleClick) {
      onArticleClick(article);
      return;
    }
    
  
    if (article.isNews) {
      window.open(article.url || article.link, '_blank');
    } else {
      const id = (article._id && (article._id.$oid || article._id)) || article.id;
      if (id) {
        window.location.href = `/article/${id}`;
      }
    }
  };

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

  const [imageLoaded, setImageLoaded] = useState(false);
  const articleImage = article.image || article.imageUrl || article.thumbnail || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop';
  const articleSummary = article.summary || article.description || article.content?.substring(0, 200) + '...';


  if (compact) {
    return (
      <div 
        className="bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-shadow" 
        onClick={handleArticleClick}
      >
        <div className="w-full h-32 bg-gray-100">
          <img 
            src={articleImage} 
            alt={article.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop'; }}
            className={`w-full h-32 object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              {article.category || 'News'}
            </span>
            {article.region && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                {article.region}
              </span>
            )}
            {article.isNews && (
              <span className="bg-gray-800 text-white px-2 py-1 rounded-full text-xs font-medium">
                Live
              </span>
            )}
            {article.status === 'published' && (
              <span className="bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                Published
              </span>
            )}
          </div>
          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
            {article.title}
          </h4>
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {getReadTime(article.content)}
            </span>
            <span>{formatDate(article.createdAt || article.publishedAt)}</span>
          </div>
        </div>
      </div>
    );
  }


  if (featured) {
    return (
      <div 
        className="bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition-shadow" 
        onClick={handleArticleClick}
      >
        <div className="w-full h-64 bg-gray-100">
          <img 
            src={articleImage} 
            alt={article.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=480&fit=crop'; }}
            className={`w-full h-64 object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                Featured
              </span>
              {article.region && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  {article.region}
                </span>
              )}
              {article.isNews && (
                <span className="bg-gray-800 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Live
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {getReadTime(article.content)}
              </span>
              <span>{formatDate(article.createdAt || article.publishedAt)}</span>
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            {article.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-3">
            {articleSummary}
          </p>
          <div className="flex items-center justify-between">
            <button className="text-gray-900 hover:text-gray-700 font-medium flex items-center">
              {article.isNews ? 'Read More' : 'Read Article'} <ChevronRight className="w-4 h-4 ml-1" />
            </button>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={(e) => e.stopPropagation()}>
                <Eye className="w-4 h-4 text-gray-400" />
                {article.views && <span className="text-xs text-gray-500 ml-1">{article.views}</span>}
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={(e) => e.stopPropagation()}>
                <Share2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div 
      className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer" 
      onClick={handleArticleClick}
    >
      <div className="w-full h-48 bg-gray-100">
        <img 
          src={articleImage} 
          alt={article.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=360&fit=crop'; }}
          className={`w-full h-48 object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-3">
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
            {article.category || 'News'}
          </span>
          {article.region && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              {article.region}
            </span>
          )}
          {article.isNews && (
            <span className="bg-gray-800 text-white px-2 py-1 rounded-full text-xs font-medium">
              Live
            </span>
          )}
          {article.status === 'published' && (
            <span className="bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              Published
            </span>
          )}
          {article.status === 'draft' && (
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
              Draft
            </span>
          )}
          {article.status === 'rejected' && (
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
              Rejected
            </span>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {articleSummary}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {getReadTime(article.content)}
            </span>
            <span>{formatDate(article.createdAt || article.publishedAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1 hover:bg-gray-100 rounded" onClick={(e) => e.stopPropagation()}>
              <Eye className="w-4 h-4 text-gray-400" />
              {article.views && <span className="text-xs text-gray-500 ml-1">{article.views}</span>}
            </button>
            <button className="p-1 hover:bg-gray-100 rounded" onClick={(e) => e.stopPropagation()}>
              <Share2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        

      </div>
    </div>
  );
};

export default ArticleCard;