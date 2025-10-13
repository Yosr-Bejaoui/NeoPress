import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, Clock, Eye, BarChart3, Plus, Activity } from 'lucide-react';
import StatCard from './StatCard';
import QuickActionCard from './QuickActionCard';
import EmptyState from './EmptyState';
import AdminManagement from './AdminManagement';
import { articleService, analyticsService } from '../services/api';


const extractArticlesArray = (response) => {
  if (Array.isArray(response)) {
    return response;
  } else if (response?.data && Array.isArray(response.data)) {
    return response.data;
  } else if (response?.articles && Array.isArray(response.articles)) {
    return response.articles;
  } else if (response && typeof response === 'object') {
    return [response];
  }
  return [];
};


const extractMongoNumber = (mongoValue) => {
  if (mongoValue?.$numberInt) {
    return parseInt(mongoValue.$numberInt);
  } else if (mongoValue?.$numberLong) {
    return parseInt(mongoValue.$numberLong);
  } else if (typeof mongoValue === 'number') {
    return mongoValue;
  } else if (typeof mongoValue === 'string') {
    return parseInt(mongoValue) || 0;
  }
  return 0;
};


const extractMongoDate = (mongoDate) => {
  if (mongoDate?.$date?.$numberLong) {
    return new Date(parseInt(mongoDate.$date.$numberLong));
  } else if (mongoDate?.$date) {
    return new Date(mongoDate.$date);
  } else if (typeof mongoDate === 'string' || typeof mongoDate === 'number') {
    return new Date(mongoDate);
  }
  return new Date();
};


const generateTrendingFromArticles = (articles) => {
  if (!Array.isArray(articles) || articles.length === 0) return [];
  
  return articles
    .map(article => ({
      id: article._id?.$oid || article._id || article.id,
      title: article.title,
      category: article.category || 'Uncategorized',
      views: extractMongoNumber(article.views),
      createdAt: extractMongoDate(article.createdAt)
    }))
    .sort((a, b) => b.views - a.views) 
    .slice(0, 5); 
};


const generateRecentActivityFromArticles = (articles) => {
  if (!Array.isArray(articles) || articles.length === 0) return [];
  
  const activities = [];
  
 
  const sortedArticles = articles
    .map(article => ({
      ...article,
      parsedDate: extractMongoDate(article.createdAt)
    }))
    .sort((a, b) => b.parsedDate - a.parsedDate);
  
 
  sortedArticles.slice(0, 3).forEach(article => {
    const views = extractMongoNumber(article.views);
    const likes = extractMongoNumber(article.likes);
    
   
    activities.push({
      id: `published-${article._id?.$oid || article.id}`,
      description: `New article published: "${article.title?.substring(0, 50)}${article.title?.length > 50 ? '...' : ''}"`,
      timestamp: article.parsedDate,
      type: 'article_published'
    });
    
 
    if (views > 10 || likes > 0) {
      activities.push({
        id: `popular-${article._id?.$oid || article.id}`,
        description: `Article gaining traction: "${article.title?.substring(0, 50)}${article.title?.length > 50 ? '...' : ''}" - ${views} views`,
        timestamp: new Date(article.parsedDate.getTime() + 60000), // Slightly later
        type: 'article_popular'
      });
    }
  });
  

  if (articles.length > 0) {
    const publishedCount = articles.filter(a => a.status === 'published').length;
    const draftCount = articles.filter(a => a.status === 'draft').length;
    
    if (publishedCount > 0) {
      activities.push({
        id: 'summary-published',
        description: `${publishedCount} article${publishedCount > 1 ? 's' : ''} currently published`,
        timestamp: new Date(Date.now() - 300000),
        type: 'summary'
      });
    }
    
    if (draftCount > 0) {
      activities.push({
        id: 'summary-drafts',
        description: `${draftCount} article${draftCount > 1 ? 's' : ''} in draft status`,
        timestamp: new Date(Date.now() - 600000), 
        type: 'summary'
      });
    }
  }
  

  return activities
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);
};

const DashboardView = ({ setCurrentView }) => {
  const [dashboardData, setDashboardData] = useState({
    totalArticles: 0,
    publishedToday: 0,
    pendingReview: 0,
    totalViews: 0,
    engagementRate: 0,
    activeUsers: 0,
    avgReadTime: 0
  });
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
    
      const [articlesResult, analyticsResult, trendingResult] = await Promise.allSettled([
        articleService.getArticles(),
        analyticsService.getDashboardStats(),
        analyticsService.getTrendingArticles(5)
      ]);
      
      let calculatedStats = {
        totalArticles: 0,
        publishedToday: 0,
        pendingReview: 0,
        totalViews: 0,
        engagementRate: 0,
        activeUsers: 0,
        avgReadTime: 0
      };
      

      if (articlesResult.status === 'fulfilled') {
        let articles = [];
        const response = articlesResult.value;
        
        if (Array.isArray(response)) {
          articles = response;
        } else if (response?.data && Array.isArray(response.data)) {
          articles = response.data;
        } else if (response?.articles && Array.isArray(response.articles)) {
          articles = response.articles;
        } else if (response && typeof response === 'object') {
          articles = [response];
        }
        
        const articleStats = calculateStatsFromArticles(articles);
        calculatedStats = { ...calculatedStats, ...articleStats };
      } else {
        console.warn('Articles API failed:', articlesResult.reason?.message);
      }
      
      if (analyticsResult.status === 'fulfilled') {
        const analytics = analyticsResult.value || {};
        calculatedStats = mergeAnalyticsData(calculatedStats, analytics);
        
        if (analytics.recentActivity && Array.isArray(analytics.recentActivity)) {
          setRecentActivity(analytics.recentActivity);
        } else {
          if (articlesResult.status === 'fulfilled') {
            const articles = extractArticlesArray(articlesResult.value);
            setRecentActivity(generateRecentActivityFromArticles(articles));
          }
        }
      } else {
        if (articlesResult.status === 'fulfilled') {
          const articles = extractArticlesArray(articlesResult.value);
          setRecentActivity(generateRecentActivityFromArticles(articles));
        }
      }
      
      if (trendingResult.status === 'fulfilled') {
        const trendingData = trendingResult.value || [];
        setTrendingArticles(trendingData);
      } else {
        if (articlesResult.status === 'fulfilled') {
          const articles = extractArticlesArray(articlesResult.value);
          const trendingFromArticles = generateTrendingFromArticles(articles);
          setTrendingArticles(trendingFromArticles);
        } else {
          setTrendingArticles([]);
        }
      }
      
      setDashboardData(calculatedStats);
      
      if (articlesResult.status === 'rejected' && analyticsResult.status === 'rejected') {
        setError('Unable to connect to backend services. Showing limited data.');
      } else if (articlesResult.status === 'rejected') {
        setError('Unable to fetch articles. Some dashboard features may be limited.');
      } else if (analyticsResult.status === 'rejected') {
        setError('Unable to fetch analytics. Some metrics may be limited.');
      }
      
    } catch (err) {
      console.error('Dashboard loading error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatsFromArticles = (articles) => {
    if (!Array.isArray(articles) || articles.length === 0) {
      return {
        totalArticles: 0,
        publishedToday: 0,
        pendingReview: 0,
        totalViews: 0
      };
    }

    const today = new Date().toDateString();
    const totalArticles = articles.length;
    
    const publishedToday = articles.filter(article => {
      const articleDate = extractMongoDate(article.createdAt);
      const isToday = articleDate.toDateString() === today;
      const isPublished = article.status === 'published';
      return isToday && isPublished;
    }).length;
    
    const pendingReview = articles.filter(article => 
      article.status === 'draft' || article.status === 'pending'
    ).length;
    
    const totalViews = articles.reduce((sum, article) => {
      const views = extractMongoNumber(article.views);
      return sum + views;
    }, 0);
    
    return {
      totalArticles,
      publishedToday,
      pendingReview,
      totalViews
    };
  };

  const mergeAnalyticsData = (articleStats, analytics) => {
    return {
      ...articleStats,
      totalArticles: analytics.totalArticles || articleStats.totalArticles,
      totalViews: analytics.totalViews || articleStats.totalViews,
      engagementRate: analytics.engagementRate || 0,
      activeUsers: analytics.activeUsers || 0,
      avgReadTime: analytics.avgReadTime || 0,
      articlesChange: analytics.articlesChange || 0,
      viewsChange: analytics.viewsChange || 0,
      engagementChange: analytics.engagementChange || 0,
      usersChange: analytics.usersChange || 0,
      readTimeChange: analytics.readTimeChange || 0
    };
  };



  const getStatsData = () => {
    if (loading) {
      return [
        { title: 'Total Articles', value: '--', change: 'Loading...', changeType: 'neutral', color: 'blue', icon: FileText },
        { title: 'Published Today', value: '--', change: 'Loading...', changeType: 'neutral', color: 'green', icon: TrendingUp },
        { title: 'Pending Review', value: '--', change: 'Loading...', changeType: 'neutral', color: 'orange', icon: Clock },
        { title: 'Total Views', value: '--', change: 'Loading...', changeType: 'neutral', color: 'purple', icon: Eye }
      ];
    }

    return [
      { 
        title: 'Total Articles', 
        value: dashboardData.totalArticles || 0, 
        change: dashboardData.articlesChange 
          ? `${dashboardData.articlesChange > 0 ? '+' : ''}${dashboardData.articlesChange}% from last week` 
          : error ? 'API not connected' : `${dashboardData.totalArticles} articles total`, 
        changeType: error ? 'neutral' : (dashboardData.articlesChange > 0 ? 'positive' : dashboardData.articlesChange < 0 ? 'negative' : 'neutral'), 
        color: 'blue', 
        icon: FileText 
      },
      { 
        title: 'Published Today', 
        value: dashboardData.publishedToday || 0, 
        change: error ? 'API not connected' : 'Published today', 
        changeType: error ? 'neutral' : (dashboardData.publishedToday > 0 ? 'positive' : 'neutral'), 
        color: 'green', 
        icon: TrendingUp 
      },
      { 
        title: 'Pending Review', 
        value: dashboardData.pendingReview || 0, 
        change: error ? 'API not connected' : 'Need review', 
        changeType: error ? 'neutral' : (dashboardData.pendingReview > 0 ? 'negative' : 'positive'), 
        color: 'orange', 
        icon: Clock 
      },
      { 
        title: 'Total Views', 
        value: (dashboardData.totalViews || 0).toLocaleString(), 
        change: dashboardData.viewsChange 
          ? `${dashboardData.viewsChange > 0 ? '+' : ''}${dashboardData.viewsChange}% from last week` 
          : error ? 'API not connected' : 'All time views', 
        changeType: error ? 'neutral' : (dashboardData.viewsChange > 0 ? 'positive' : dashboardData.viewsChange < 0 ? 'negative' : 'neutral'), 
        color: 'purple', 
        icon: Eye 
      }
    ];
  };

  const quickActions = [
    {
      icon: FileText,
      title: 'Manage Articles',
      description: 'Review, edit, and publish AI-generated articles',
      buttonText: 'Go to Articles',
      onClick: () => setCurrentView('articles'),
      color: 'blue'
    },
    {
      icon: BarChart3,
      title: 'View Analytics',
      description: 'Detailed insights and performance metrics',
      buttonText: 'View Analytics',
      onClick: () => setCurrentView('analytics'),
      color: 'green'
    },
    {
      icon: Plus,
      title: 'Generate Content',
      description: 'Create new AI-powered articles',
      buttonText: 'Generate Article',
      onClick: () => setCurrentView('generate'),
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-8">
   
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, Admin</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your news platform today.</p>
        {error && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">⚠️ {error}</p>
            <p className="text-yellow-600 text-xs mt-1">
              Dashboard is showing available data. Some features may be limited.
            </p>
            <button 
              onClick={loadDashboardData}
              className="text-yellow-800 underline hover:no-underline text-sm mt-2"
            >
              Retry connection
            </button>
          </div>
        )}
      </div>

   
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatsData().map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

  
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <QuickActionCard key={index} {...action} />
        ))}
      </div>

      

   
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          Trending Articles
        </h3>
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : trendingArticles.length > 0 ? (
          <div className="space-y-3">
            {trendingArticles.slice(0, 5).map((article, index) => (
              <div key={article.id || article._id?.$oid || index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-400 w-4">#{index + 1}</span>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{article.title}</h4>
                    <p className="text-xs text-gray-600">{article.category || 'Uncategorized'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{(article.views || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-600">views</p>
                </div>
              </div>
            ))}
            <div className="mt-4 text-center">
              <button 
                onClick={() => setCurrentView('analytics')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all trending articles →
              </button>
            </div>
          </div>
        ) : (
          <EmptyState 
            title="No trending articles yet"
            description="Popular articles will appear here as they gain traction"
          />
        )}
      </div>

     
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity size={20} />
          Recent Activity
        </h3>
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={activity.id || index} className="flex items-center gap-3 py-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Recently'}
                  </p>
                </div>
              </div>
            ))}
            <div className="mt-4 text-center">
              <button 
                onClick={() => setCurrentView('analytics')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all activity →
              </button>
            </div>
          </div>
        ) : (
          <EmptyState 
            title=""
            description="Recent activity will appear here once users start interacting with your content..."
          />
        )}
      </div>

      <AdminManagement />
    </div>
  );
};

export default DashboardView;