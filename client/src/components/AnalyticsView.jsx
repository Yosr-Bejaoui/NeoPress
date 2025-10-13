import React, { useState, useEffect } from 'react';
import { BarChart3, Download, RefreshCw, TrendingUp, Users, Eye, FileText, Clock, ThumbsUp, Share2, Bot, PieChart, BookOpen, CheckCircle, AlertCircle, FileEdit } from 'lucide-react';
import { analyticsService } from '../services/api';
import EmptyState from './EmptyState';

const AnalyticsView = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, trendingResponse, performanceResponse] = await Promise.allSettled([
        analyticsService.getDashboardStats(),
        analyticsService.getTrendingArticles(10),
        analyticsService.getPerformanceOverTime(selectedPeriod)
      ]);

 
      if (statsResponse.status === 'fulfilled') {
        console.log('Analytics stats response:', statsResponse.value);
        setDashboardStats(statsResponse.value);
      } else {
        setDashboardStats({
          totalViews: 0,
          totalArticles: 0,
          activeUsers: 0,
          engagementRate: 0,
          avgReadTime: 0,
          viewsChange: 0,
          articlesChange: 0,
          usersChange: 0,
          engagementChange: 0
        });
        console.warn('Dashboard stats API failed:', statsResponse.reason?.message);
      }

      if (trendingResponse.status === 'fulfilled') {
        setTrendingArticles(trendingResponse.value);
      } else {
        setTrendingArticles([]);
        console.warn('Trending articles API failed:', trendingResponse.reason?.message);
      }

      if (performanceResponse.status === 'fulfilled') {
        setPerformanceData(performanceResponse.value);
      } else {
        setPerformanceData(null);
        console.warn('Performance data API failed:', performanceResponse.reason?.message);
      }

      if (statsResponse.status === 'rejected' && 
          trendingResponse.status === 'rejected' && 
          performanceResponse.status === 'rejected') {
        setError('Backend API is not available. Using demo data.');
      }
      
    } catch (err) {
      setError(err.message);
      console.error('Failed to load analytics:', err);
      
      setDashboardStats({
        totalViews: 0,
        totalArticles: 0,
        activeUsers: 0,
        engagementRate: 0,
        avgReadTime: 0
      });
      setTrendingArticles([]);
      setPerformanceData(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const exportReport = () => {
    const csvData = [
      ['Metric', 'Value', 'Period'],
      ['Total Views', dashboardStats?.totalViews || 0, selectedPeriod],
      ['Total Articles', dashboardStats?.totalArticles || 0, selectedPeriod],
      ['Active Users', dashboardStats?.activeUsers || 0, selectedPeriod],
      ['Engagement Rate', `${dashboardStats?.engagementRate || 0}%`, selectedPeriod],
      ['Average Read Time', `${dashboardStats?.avgReadTime || 0}m`, selectedPeriod]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getEngagementMetrics = () => {
    if (loading) {
      return [
        { title: 'Total Views', value: '--', change: 'Loading...', icon: Eye, color: 'blue' },
        { title: 'Total Likes', value: '--', change: 'Loading...', icon: ThumbsUp, color: 'purple' },
        { title: 'Total Shares', value: '--', change: 'Loading...', icon: Share2, color: 'orange' },
        { title: 'Average Read Time', value: '--', change: 'Loading...', icon: Clock, color: 'teal' }
      ];
    }
    return [
      { 
        title: 'Total Views', 
        value: dashboardStats?.totalViews?.toLocaleString() || '0',
        change: error ? 'API not connected' : 'All time views across articles',
        icon: Eye, 
        color: 'blue' 
      },
      { 
        title: 'Total Likes', 
        value: dashboardStats?.totalLikes?.toLocaleString() || '0',
        change: error ? 'API not connected' : 'Total article likes',
        icon: ThumbsUp, 
        color: 'purple' 
      },
      { 
        title: 'Total Shares', 
        value: dashboardStats?.totalShares?.toLocaleString() || '0',
        change: error ? 'API not connected' : 'Articles shared by readers',
        icon: Share2, 
        color: 'orange' 
      },
      {
        title: 'Average Read Time',
        value: `${dashboardStats?.avgReadTime || 0}m`,
        change: error ? 'API not connected' : 'Average minutes per article',
        icon: Clock,
        color: 'teal'
      }
    ];
  };

  const getContentMetrics = () => {
    if (loading) {
      return [
        { title: 'Total Articles', value: '--', change: 'Loading...', icon: FileText, color: 'blue' },
        { title: 'Published', value: '--', change: 'Loading...', icon: CheckCircle, color: 'green' },
        { title: 'Pending Review', value: '--', change: 'Loading...', icon: AlertCircle, color: 'orange' },
        { title: 'Recent (7 days)', value: '--', change: 'Loading...', icon: FileEdit, color: 'purple' }
      ];
    }
    return [
      { 
        title: 'Total Articles', 
        value: dashboardStats?.totalArticles || 0,
        change: error ? 'API not connected' : 'All articles in system',
        icon: FileText, 
        color: 'blue' 
      },
      { 
        title: 'Published', 
        value: dashboardStats?.publishedArticles || 0,
        change: error ? 'API not connected' : `${dashboardStats?.publishedToday || 0} published today`,
        icon: CheckCircle, 
        color: 'green' 
      },
      { 
        title: 'Pending Review', 
        value: dashboardStats?.pendingReview || 0,
        change: error ? 'API not connected' : 'Awaiting approval',
        icon: AlertCircle, 
        color: 'orange' 
      },
      { 
        title: 'Recent (7 days)', 
        value: dashboardStats?.recentArticles || 0,
        change: error ? 'API not connected' : 'Articles created last week',
        icon: FileEdit, 
        color: 'purple' 
      }
    ];
  };

  const renderMetricCard = (metric) => {
    const Icon = metric.icon;
    return (
      <div key={metric.title} className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">{metric.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            <p className={`text-sm mt-1 ${
              metric.change.includes('Error') ? 'text-red-500' : 'text-gray-400'
            }`}>
              {metric.change}
            </p>
          </div>
          <Icon className={
            metric.color === 'blue' ? 'text-blue-500' :
            metric.color === 'green' ? 'text-green-500' :
            metric.color === 'purple' ? 'text-purple-500' :
            metric.color === 'orange' ? 'text-orange-500' :
            'text-gray-400'
          } size={24} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600 mt-2">Comprehensive performance metrics and data insights</p>
          {error && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-800 text-sm">{error}</p>
                  <p className="text-yellow-600 text-xs mt-1">
                    Analytics is showing demo data. Connect your backend API to see real metrics.
                  </p>
                  <button 
                    onClick={loadAnalyticsData}
                    className="text-yellow-800 underline hover:no-underline text-sm mt-2"
                  >
                    Retry connection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button 
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button 
            onClick={exportReport}
            disabled={!dashboardStats}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          Engagement Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getEngagementMetrics().map(renderMetricCard)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getContentMetrics().map(renderMetricCard)}
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          Top Performing Articles
        </h3>
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : trendingArticles.length > 0 ? (
          <div className="space-y-4">
            {trendingArticles.slice(0, 10).map((article, index) => (
              <div key={article.id || article._id?.$oid || index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-400 w-6">#{index + 1}</span>
                  <div>
                    <h4 className="font-medium text-gray-900 line-clamp-1">{article.title}</h4>
                    <p className="text-sm text-gray-600">{article.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{article.views?.toLocaleString() || 0}</p>
                  <p className="text-sm text-gray-600">views</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No articles yet"
            description="Articles will appear here as they are published"
          />
        )}
      </div>

      {dashboardStats?.categoryStats && dashboardStats.categoryStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart size={20} />
            Content by Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {dashboardStats.categoryStats.slice(0, 10).map((cat, idx) => (
              <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <p className="text-sm font-medium text-gray-900 mb-1">{cat.category}</p>
                <p className="text-2xl font-bold text-blue-600">{cat.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={20} />
          Performance Over Time ({selectedPeriod})
        </h3>
        {loading ? (
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        ) : (
          (() => {
            let arr = [];
            const raw = performanceData;
            if (Array.isArray(raw?.values)) {
              arr = raw.values;
            } else if (Array.isArray(raw?.data)) {
              arr = raw.data;
            } else if (Array.isArray(raw)) {
              arr = raw;
            } else if (raw && typeof raw === 'object') {
              arr = Object.values(raw);
            }
            const data = (arr || []).map((v) => Number(v?.views ?? v) || 0);
            if (!data.length) {
              return (
                <EmptyState 
                  icon={BarChart3}
                  title="No performance data available"
                  description="Performance charts will appear here once data is collected"
                />
              );
            }
            const width = 800; const height = 220; const pad = 30;
            const xs = data.map((_, i) => i);
            const ys = data;
            const minY = Math.min(...ys, 0); const maxY = Math.max(...ys, 1);
            const x = (i) => pad + (i / Math.max(xs.length - 1, 1)) * (width - pad * 2);
            const y = (v) => height - pad - ((v - minY) / Math.max(maxY - minY, 1)) * (height - pad * 2);
            const dAttr = ys.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
            return (
              <div className="h-64 bg-gray-50 rounded p-4">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width={width} height={height} fill="white" />
                  <path d={dAttr} fill="none" stroke="#3b82f6" strokeWidth="2" />
                  <path d={`${dAttr} L ${x(ys.length - 1)} ${y(minY)} L ${x(0)} ${y(minY)} Z`} fill="url(#grad)" />
                </svg>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

export default AnalyticsView;