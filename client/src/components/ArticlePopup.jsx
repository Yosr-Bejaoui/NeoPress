import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Eye, Clock, Share2, Bookmark } from 'lucide-react';

const ArticlePopup = ({ article, onClose, onNavigate, allArticles, isOpen }) => {
  const [relatedArticles, setRelatedArticles] = useState([]);
  const contentRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const normalizeId = (a) => (a?._id?.$oid || a?._id || a?.id);

  useEffect(() => {
    if (article && allArticles) {
      const related = allArticles
        .filter(a => (normalizeId(a) !== normalizeId(article)) && a.category === article.category)
        .slice(0, 3);
      setRelatedArticles(related);
      
   
      const savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]');
      setIsSaved(savedArticles.includes(normalizeId(article)));
      
    
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [article, allArticles]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'ArrowRight') {
        if (!allArticles) return;
        const idx = allArticles.findIndex(a => (normalizeId(a) === normalizeId(article)));
        if (idx >= 0 && idx < allArticles.length - 1) {
          onNavigate && onNavigate(allArticles[idx + 1]);
        }
      }
      if (event.key === 'ArrowLeft') {
        if (!allArticles) return;
        const idx = allArticles.findIndex(a => (normalizeId(a) === normalizeId(article)));
        if (idx > 0) {
          onNavigate && onNavigate(allArticles[idx - 1]);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = modalRef.current.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      const elements = Array.from(focusable).filter((el) => !el.hasAttribute('disabled'));
      if (elements.length === 0) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    modalRef.current.addEventListener('keydown', handleKeyDown);
    return () => modalRef.current && modalRef.current.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const el = contentRef.current;
    if (!isOpen || !el) return;
    const onScroll = () => {
      const total = el.scrollHeight - el.clientHeight;
      const current = el.scrollTop;
      const pct = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;
      setProgress(pct);
    };
    el.addEventListener('scroll', onScroll);
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [isOpen, contentRef]);

  if (!isOpen || !article) {
    return null;
  }

  const formatDate = (dateString) => {
    try {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Unknown date';
    }
  };

  const formatViews = (views) => {
    if (!views) return '0';
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    }
    if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toLocaleString();
  };

  const getReadTime = (content) => {
    if (!content) return '5 min read';
    const words = content.split(' ').length;
    const readTime = Math.ceil(words / 200);
    return `${readTime} min read`;
  };

  const handleNavigate = (relatedArticle) => {
    if (relatedArticle && onNavigate) {
      onNavigate(relatedArticle);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  const handleCloseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleSaveArticle = () => {
    const articleId = normalizeId(article);
    const savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]');
    
    if (isSaved) {
     
      const updated = savedArticles.filter(id => id !== articleId);
      localStorage.setItem('savedArticles', JSON.stringify(updated));
      setIsSaved(false);
    } else {
      
      savedArticles.push(articleId);
      localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
      setIsSaved(true);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = article.title || 'Check out this article';
    const text = article.summary || article.title || '';
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          alert('Link copied to clipboard!');
        });
        break;
      default:
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div 
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="border-b border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                {article.category || 'Uncategorized'}
              </span>
              {article.region && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {article.region}
                </span>
              )}
              <span className="text-sm text-gray-500">
                {formatDate(article.createdAt || article.publishedAt)}
              </span>
              {article.views && (
                <span className="text-sm text-gray-500 flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {formatViews(article.views)}
                </span>
              )}
            </div>
            
            <button
              ref={closeBtnRef}
              onClick={handleCloseClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close article"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div ref={contentRef} className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-6">
              {article.title || 'Untitled Article'}
            </h1>
            
            {article.summary && (
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                  <p className="text-gray-700 leading-relaxed font-medium">
                    {article.summary}
                  </p>
                </div>
              </div>
            )}

            {article.image && (
              <div className="mb-6">
                <img
                  src={article.image}
                  alt={article.title || 'Article image'}
                  className="w-full h-64 md:h-80 object-cover rounded-lg"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <ReaderContent content={article.content} />

            <div className="flex items-center space-x-3 py-4 border-t border-gray-100 mb-6">
              <button 
                onClick={handleSaveArticle}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isSaved 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                
                {showShareMenu && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px] z-10">
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700 flex items-center space-x-2"
                    >
                      <span>Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700 flex items-center space-x-2"
                    >
                      <span>Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700 flex items-center space-x-2"
                    >
                      <span>LinkedIn</span>
                    </button>
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700 flex items-center space-x-2"
                    >
                      <span>WhatsApp</span>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={() => handleShare('copy')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700 flex items-center space-x-2"
                    >
                      <span>Copy Link</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500 ml-auto">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {getReadTime(article.content)}
                </span>
              </div>
            </div>

            {relatedArticles.length > 0 && (
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Related Articles
                </h3>
                <div className="space-y-4">
                  {relatedArticles.map((relatedArticle) => (
                    <div
                      key={relatedArticle._id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNavigate(relatedArticle);
                      }}
                      className="cursor-pointer p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex space-x-4">
                        {relatedArticle.image && (
                          <img
                            src={relatedArticle.image}
                            alt={relatedArticle.title || 'Related article'}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full mb-2">
                            {relatedArticle.category || 'Uncategorized'}
                          </span>
                          <h4 className="font-medium text-gray-900 line-clamp-2 text-sm mb-1">
                            {relatedArticle.title || 'Untitled'}
                          </h4>
                          {relatedArticle.summary && (
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {relatedArticle.summary}
                            </p>
                          )}
                          <div className="flex items-center mt-2 text-xs text-gray-500 space-x-3">
                            <span>{formatDate(relatedArticle.createdAt || relatedArticle.publishedAt)}</span>
                            {relatedArticle.views && (
                              <span className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {formatViews(relatedArticle.views)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePopup;

const ReaderContent = ({ content }) => {
  const [size, setSize] = useState('base');
  const sizes = {
    sm: 'text-sm leading-7',
    base: 'text-base leading-8',
    lg: 'text-lg leading-9',
  };
  const current = sizes[size] || sizes.base;
  return (
    <div className="mb-8">
      <div className="flex items-center justify-end gap-2 mb-3">
        <span className="text-xs text-gray-500">Font</span>
        <button onClick={() => setSize('sm')} className={`px-2 py-1 border rounded ${size==='sm'?'bg-gray-100':''}`}>A-</button>
        <button onClick={() => setSize('base')} className={`px-2 py-1 border rounded ${size==='base'?'bg-gray-100':''}`}>A</button>
        <button onClick={() => setSize('lg')} className={`px-2 py-1 border rounded ${size==='lg'?'bg-gray-100':''}`}>A+</button>
      </div>
      <div className={`prose max-w-none ${current} font-serif text-gray-800`}>
        <div className="whitespace-pre-wrap">{content || 'No content available for this article.'}</div>
      </div>
    </div>
  );
};