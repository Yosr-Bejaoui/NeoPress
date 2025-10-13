import React, { useState } from 'react';
import { User, CheckCircle, XCircle, Edit, BarChart3, Eye, Trash2, ExternalLink } from 'lucide-react';

const ArticleCard = ({ 
  article, 
  onEdit, 
  onAnalytics, 
  onApprove, 
  onReject, 
  onDelete, 
  onViewFull,
  isSelected = false,
  onSelect 
}) => {
  const [isProcessing, setIsProcessing] = useState({
    approve: false,
    reject: false,
    delete: false
  });

  if (!article) {
    return <div className="bg-red-50 border border-red-200 rounded-lg p-4">Error: No article data provided</div>;
  }

  const safeArticle = {
    id: article._id?.$oid || article._id || article.id || `article-${Date.now()}`,
    title: article.title || 'Untitled Article',
    summary: article.summary || article.content?.substring(0, 200) + '...' || 'No summary available',
    status: article.status || 'draft',
    author: article.author || 'Unknown Author',
    date: article.date || new Date().toLocaleDateString(),
    category: article.category,
    region: article.region,
    tags: Array.isArray(article.tags) ? article.tags : [],
    views: article.views || 0,
    wordCount: article.wordCount || article.content?.split(/\s+/).length || 0,
    sourceUrl: article.sourceUrl,
    sourceName: article.sourceName,
    content: article.content || article.body || article.text || '',
    url: article.url,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    ...article
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'pending':
      case 'draft':
        return 'bg-orange-100 text-orange-800';
      case 'published':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isPending = safeArticle.status?.toLowerCase() === 'pending' || safeArticle.status?.toLowerCase() === 'draft';

  const handleApprove = async () => {
    if (!onApprove) {
      console.warn('ArticleCard: onApprove function not provided');
      return;
    }
    
    setIsProcessing(prev => ({ ...prev, approve: true }));
    try {
      await onApprove(safeArticle.id);
    } catch (error) {
      console.error('Failed to approve article:', error);
      alert('Failed to approve article. Please try again.');
    } finally {
      setIsProcessing(prev => ({ ...prev, approve: false }));
    }
  };

  const handleReject = async () => {
    if (!onReject) {
      console.warn('ArticleCard: onReject function not provided');
      return;
    }
    
    setIsProcessing(prev => ({ ...prev, reject: true }));
    try {
      await onReject(safeArticle.id);
    } catch (error) {
      console.error('Failed to reject article:', error);
      alert('Failed to reject article. Please try again.');
    } finally {
      setIsProcessing(prev => ({ ...prev, reject: false }));
    }
  };

  const handleDelete = async () => {
    if (!onDelete) {
      console.warn('ArticleCard: onDelete function not provided');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }
    
    setIsProcessing(prev => ({ ...prev, delete: true }));
    try {
      await onDelete(safeArticle.id);
    } catch (error) {
      console.error('Failed to delete article:', error);
      alert('Failed to delete article. Please try again.');
    } finally {
      setIsProcessing(prev => ({ ...prev, delete: false }));
    }
  };

  const handleEdit = () => {
    if (!onEdit || !safeArticle.id) {
      alert('Edit functionality is not available');
      return;
    }

    try {
      onEdit(safeArticle);
    } catch (error) {
      alert('Failed to open edit dialog. Please try again.');
    }
  };

  const handleAnalytics = () => {
    if (!onAnalytics) {
      alert('Analytics functionality is not available');
      return;
    }
    onAnalytics(safeArticle);
  };

  const handleViewFull = () => {
    if (onViewFull) {
      onViewFull(safeArticle);
    } else if (safeArticle.url || safeArticle.sourceUrl) {
      window.open(safeArticle.url || safeArticle.sourceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getAuthorName = (author) => {
    if (typeof author === 'object' && author !== null) {
      return author.name || 'AI Assistant';
    }
    return author || 'AI Assistant';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 mb-4 hover:shadow-md transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        {onSelect && (
          <div className="mr-4 pt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(safeArticle.status)}`}>
              {safeArticle.status}
            </span>
            {safeArticle.category && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {safeArticle.category}
              </span>
            )}
            {safeArticle.region && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {safeArticle.region}
              </span>
            )}
            {safeArticle.tags && safeArticle.tags.length > 0 && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {safeArticle.tags[0]}
                {safeArticle.tags.length > 1 && ` +${safeArticle.tags.length - 1}`}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors" onClick={handleViewFull}>
            {safeArticle.title}
          </h3>
          <p className="text-gray-600 mb-3 line-clamp-3">{safeArticle.summary}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <User size={14} />
              {getAuthorName(safeArticle.author)}
            </span>
            <span>{safeArticle.date}</span>
            {safeArticle.confidence && (
              <span>AI Confidence: {safeArticle.confidence}</span>
            )}
            {safeArticle.views !== undefined && safeArticle.views !== null && (
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {safeArticle.views} views
              </span>
            )}
            {safeArticle.wordCount && (
              <span>{safeArticle.wordCount} words</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {isPending && onApprove && onReject && (
              <>
                <button 
                  onClick={handleApprove}
                  disabled={isProcessing.approve}
                  className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={16} className={isProcessing.approve ? 'animate-spin' : ''} />
                  {isProcessing.approve ? 'Approving...' : 'Approve'}
                </button>
                <button 
                  onClick={handleReject}
                  disabled={isProcessing.reject}
                  className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle size={16} className={isProcessing.reject ? 'animate-spin' : ''} />
                  {isProcessing.reject ? 'Rejecting...' : 'Reject'}
                </button>
              </>
            )}
            
            <button 
              onClick={handleEdit}
              disabled={!onEdit || !safeArticle.id}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
                onEdit && safeArticle.id
                  ? 'border border-blue-500 text-blue-700 hover:bg-blue-50' 
                  : 'border border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
              title={!onEdit ? 'Edit functionality not available' : !safeArticle.id ? 'Cannot edit: Article ID missing' : 'Edit this article'}
            >
              <Edit size={16} />
              Edit
            </button>
            
            <button 
              onClick={handleAnalytics}
              disabled={!onAnalytics}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
                onAnalytics 
                  ? 'border border-green-500 text-green-700 hover:bg-green-50' 
                  : 'border border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
              title={!onAnalytics ? 'Analytics functionality not available' : 'View analytics for this article'}
            >
              <BarChart3 size={16} />
              Analytics
            </button>
            
            {onDelete && (
              <button 
                onClick={handleDelete}
                disabled={isProcessing.delete}
                className="flex items-center gap-1 px-3 py-2 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete this article"
              >
                <Trash2 size={16} className={isProcessing.delete ? 'animate-spin' : ''} />
                {isProcessing.delete ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
          
          <button 
            onClick={handleViewFull}
            className="flex items-center gap-1 px-3 py-2 text-gray-700 text-sm hover:bg-gray-50 rounded-md transition-colors"
            title="View full article"
          >
            <Eye size={16} />
            View Full
          </button>
        </div>
      </div>
      
      {(safeArticle.sourceUrl || safeArticle.sourceName) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Source:</span>
            {safeArticle.sourceUrl ? (
              <a 
                href={safeArticle.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
              >
                {safeArticle.sourceName || 'View Original'}
                <ExternalLink size={12} />
              </a>
            ) : (
              <span>{safeArticle.sourceName}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleCard;