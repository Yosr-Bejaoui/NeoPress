import React, { useState, useEffect } from 'react';
import { BarChart3, Eye, Share2, Clock, TrendingUp, Users, AlertCircle, RefreshCw, X } from 'lucide-react';
import { analyticsService } from '../services/api';
import EmptyState from './EmptyState';

const AnalyticsModal = ({ isOpen, onClose, article }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (isOpen && article?.id) {
      loadAnalytics();
    }
  }, [isOpen, article?.id]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await analyticsService.getArticleAnalytics(article.id);
      const analyticsData = data?.data ?? data?.analytics ?? data;
      setAnalytics(analyticsData);
      setRetryCount(0);
      
    } catch (err) {
      const errorMsg = err.response?.status === 404 ? 'Analytics endpoint not found.' :
                      err.code === 'NETWORK_ERROR' ? 'Cannot connect to analytics service.' :
                      err.response?.status === 500 ? 'Server error occurred.' :
                      err.message;
      
      setError(errorMsg);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };



  const handleRefresh = () => {
    setRetryCount(prev => prev + 1);
    loadAnalytics();
  };

  if (!isOpen || !article) return null;

  const renderMetricCard = (title, value, IconComponent, color = 'blue', subtitle = null) => (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-${color}-600 text-sm font-medium`}>{title}</p>
          <p className={`text-${color}-900 text-2xl font-bold mt-1`}>{value}</p>
          {subtitle && (
            <p className={`text-${color}-600 text-xs mt-1`}>{subtitle}</p>
          )}
        </div>
        <IconComponent className={`text-${color}-400 flex-shrink-0`} size={24} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
      
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 size={20} />
              Article Analytics
            </h2>
            <p className="text-gray-600 text-sm mt-1 truncate">
              Performance metrics for: {article.title}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
        
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-gray-600">
                <RefreshCw className="animate-spin" size={24} />
                <span>Loading analytics data...</span>
              </div>
            </div>
          )}

        
          {!loading && error && !analytics && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium text-red-800 mb-2">Analytics Data Unavailable</h3>
                <div className="text-red-600 mb-4">{error}</div>
                <div className="text-sm text-gray-600 mb-6">
                  To see analytics data, you need to:
                  <ul className="mt-2 text-left list-disc list-inside space-y-1">
                    <li>Implement the analytics API endpoint</li>
                    <li>Ensure the backend server is running</li>
                    <li>Check your API configuration</li>
                    <li>Verify the article ID exists in your analytics system</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={handleRefresh}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Retrying...' : 'Retry'}
                  </button>
                  <div className="text-xs text-gray-500">
                    Expected API endpoint: <code className="bg-gray-100 px-1 rounded">GET /api/analytics/articles/{article.id}</code>
                  </div>
                </div>
              </div>
            </div>
          )}

         
          {!loading && !error && !analytics && (
            <EmptyState 
              icon={BarChart3}
              title="No analytics data available"
              description="Analytics data for this article is not yet available. Data will appear here once the article starts receiving traffic."
            />
          )}

       
          {analytics && (
            <div className="space-y-8">
         
              <div>
                <h3 className="text-lg font-semibold mb-4">Key Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {renderMetricCard('Total Views', analytics.views?.toLocaleString() || '0', Eye, 'blue')}
                  {renderMetricCard('Unique Visitors', analytics.uniqueVisitors?.toLocaleString() || '0', Users, 'green')}
                  {renderMetricCard('Shares', analytics.shares?.toLocaleString() || '0', Share2, 'purple')}
                  {renderMetricCard(
                    'Avg. Read Time', 
                    `${analytics.avgReadTime || 0}min`, 
                    Clock, 
                    'orange',
                    'Per session'
                  )}
                  {renderMetricCard(
                    'Engagement Rate', 
                    `${analytics.engagementRate || 0}%`, 
                    TrendingUp, 
                    'indigo'
                  )}
                </div>
              </div>

            
              <div>
                <h3 className="text-lg font-semibold mb-4">Additional Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">Impressions</h4>
                    <p className="text-2xl font-bold text-gray-600 mt-1">
                      {analytics.impressions?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">Click-Through Rate</h4>
                    <p className="text-2xl font-bold text-gray-600 mt-1">
                      {analytics.clickThroughRate || 'N/A'}%
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">Bounce Rate</h4>
                    <p className="text-2xl font-bold text-gray-600 mt-1">
                      {analytics.bounceRate || 'N/A'}%
                    </p>
                  </div>
                </div>
              </div>

         
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">Article Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600">Published:</span>
                      <span className="ml-2 font-medium">
                        {article.publishedAt ? 
                          new Date(article.publishedAt).toLocaleDateString() : 
                          new Date(article.createdAt || Date.now()).toLocaleDateString()
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <span className="ml-2 font-medium">{article.category || 'Uncategorized'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 font-medium ${
                        article.status === 'published' ? 'text-green-600' : 
                        article.status === 'approved' ? 'text-blue-600' :
                        article.status === 'pending' ? 'text-orange-600' :
                        'text-gray-600'
                      }`}>
                        {article.status || 'draft'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="ml-2 font-medium">
                        {new Date(article.updatedAt || article.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Word Count:</span>
                      <span className="ml-2 font-medium">
                        {article.wordCount || 
                         (article.content?.split(/\s+/).length) || 
                         (article.summary?.split(/\s+/).length) || 
                         'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Author:</span>
                      <span className="ml-2 font-medium">
                        {typeof article.author === 'object' ? article.author.name : article.author || 'AI Assistant'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

       
              {analytics.trafficSources && (
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Traffic Sources</h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.trafficSources).map(([source, count]) => {
                      const percentage = ((count / analytics.views) * 100).toFixed(1);
                      return (
                        <div key={source} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="capitalize font-medium">{source}</span>
                            <div className="bg-gray-200 rounded-full h-2 w-32">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold">{count.toLocaleString()}</span>
                            <span className="text-gray-500 text-sm ml-2">({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

           
              {analytics.socialShares && (
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Social Media Shares</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(analytics.socialShares).map(([platform, shares]) => (
                      <div key={platform} className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{shares}</div>
                        <div className="text-sm text-gray-600 capitalize">{platform}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

        
              {analytics.topCountries && (
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Top Countries</h3>
                  <div className="space-y-2">
                    {analytics.topCountries.map((country, index) => (
                      <div key={country.name} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <span className="font-medium">{country.name}</span>
                        </div>
                        <span className="font-bold">{country.views.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
      
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {analytics ? 'Real analytics data loaded successfully' : 'No analytics data available'}
            {retryCount > 0 && ` (Attempt ${retryCount + 1})`}
          </div>
          <div className="flex gap-3">
            {analytics && (
              <button 
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
                Refresh
              </button>
            )}
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;