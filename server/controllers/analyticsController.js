import Article from "../models/Article.js"; 

const getDashboardStats = async (req, res) => {
  try {
    
    const articles = await Article.find();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const publishedToday = await Article.countDocuments({
      status: 'published',
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    const totalArticles = articles.length;
    
    const pendingReview = await Article.countDocuments({
      $or: [
        { status: 'draft' },
        { status: 'pending' }
      ]
    });
    
    
    const engagementAggregation = await Article.aggregate([
      { 
        $group: { 
          _id: null, 
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: "$likes" },
          totalShares: { $sum: "$shares" }
        } 
      }
    ]);
    const engagement = engagementAggregation.length > 0 ? engagementAggregation[0] : {
      totalViews: 0, totalLikes: 0, totalShares: 0
    };
    

    const aiGeneratedCount = await Article.countDocuments({ 
      'metadata.aiGenerated': true 
    });
    
   
    const aiProviderStats = await Article.aggregate([
      { $match: { 'metadata.aiGenerated': true } },
      { $group: { _id: "$metadata.aiProvider", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
   
    const topArticles = await Article.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(5)
      .select('title views likes shares createdAt');
    
  
    const avgWordCount = await Article.aggregate([
      { $match: { status: 'published', 'analytics.wordCount': { $exists: true } } },
      { $group: { _id: null, avgWords: { $avg: "$analytics.wordCount" } } }
    ]);
    
    const avgReadTime = await Article.aggregate([
      { $match: { status: 'published', 'analytics.readTime': { $exists: true } } },
      { $group: { _id: null, avgTime: { $avg: "$analytics.readTime" } } }
    ]);
   
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const recentArticles = await Article.countDocuments({
      createdAt: { $gte: lastWeek }
    });
    
    
    const categoryStats = await Article.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const stats = {
  
      totalArticles,
      publishedArticles: await Article.countDocuments({ status: 'published' }),
      publishedToday,
      pendingReview,
      
     
      totalViews: engagement.totalViews,
      totalLikes: engagement.totalLikes,
      totalShares: engagement.totalShares,
      
      
      avgWordCount: avgWordCount.length > 0 ? Math.round(avgWordCount[0].avgWords) : 0,
      avgReadTime: avgReadTime.length > 0 ? Math.round(avgReadTime[0].avgTime) : 0,
      
     
      aiGeneratedCount,
      aiGeneratedPercentage: totalArticles > 0 ? Math.round((aiGeneratedCount / totalArticles) * 100) : 0,
      
  
      recentArticles,
      
     
      categoryStats: categoryStats.map(cat => ({
        category: cat._id || 'Uncategorized',
        count: cat.count
      })),
      
      aiProviderStats: aiProviderStats.map(provider => ({
        provider: provider._id || 'Unknown',
        count: provider.count
      })),
      
     
      topArticles: topArticles.map(article => ({
        id: article._id,
        title: article.title,
        views: article.views,
        likes: article.likes,
        shares: article.shares,
        createdAt: article.createdAt
      }))
    };
    
    res.json({
      success: true,
      ...stats
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

const getArticleAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
   
    const analytics = {
     
      articleId: id,
      title: article.title,
      status: article.status,
      category: article.category,
      tags: article.tags || [],
      
    
      summary: article.summary,
      wordCount: article.analytics?.wordCount || 0,
      readTime: article.analytics?.readTime || 0,
      
     
      views: article.views || 0,
      likes: article.likes || 0,
      shares: article.shares || 0,
      comments: article.analytics?.engagement?.comments || 0,
      reactions: article.analytics?.engagement?.reactions || 0,
      
     
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      publishedAt: article.publishedAt,
      
     
      author: article.author,
      reviewedBy: article.reviewedBy,
      approvedBy: article.approvedBy,
      
  
      aiGenerated: article.metadata?.aiGenerated || false,
      aiProvider: article.metadata?.aiProvider,
      regenerationCount: article.metadata?.regenerationCount || 0,
      lastRegeneratedAt: article.metadata?.lastRegeneratedAt,
      originalNewsTitle: article.metadata?.originalNewsTitle,
      sourceName: article.sourceName,
      sourceUrl: article.sourceUrl,
      
     
      seo: {
        metaDescription: article.metaDescription,
        metaKeywords: article.metaKeywords,
        slug: article.slug,
        url: article.url
      },
      
    
      hasMainImage: !!article.image,
      imageCount: article.images?.length || 0,
      resourceCount: article.resources?.length || 0,
      
     
      generationSettings: article.metadata?.generationSettings
    };
    
    res.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('Error fetching article analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch article analytics',
      error: error.message
    });
  }
};


const getTrendingArticles = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const trendingArticles = await Article.find({ status: 'published' })
      .sort({ views: -1, likes: -1, shares: -1 })
      .limit(parseInt(limit))
      .select('title views likes shares createdAt category region');
    
    const articles = trendingArticles.map(article => ({
      id: article._id,
      title: article.title,
      views: article.views || 0,
      likes: article.likes || 0,
      shares: article.shares || 0,
      createdAt: article.createdAt,
      category: article.category,
      region: article.region
    }));
    
    res.json({
      success: true,
      articles
    });
    
  } catch (error) {
    console.error('Error fetching trending articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending articles',
      error: error.message
    });
  }
};


const getPerformanceOverTime = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
   
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    
    const articles = await Article.find({
      status: 'published',
      createdAt: { $gte: startDate, $lte: endDate }
    }).select('views likes shares createdAt');
    
    
    const dailyStats = {};
    articles.forEach(article => {
      const date = article.createdAt.toDateString();
      if (!dailyStats[date]) {
        dailyStats[date] = { views: 0, likes: 0, shares: 0, articles: 0 };
      }
      dailyStats[date].views += article.views || 0;
      dailyStats[date].likes += article.likes || 0;
      dailyStats[date].shares += article.shares || 0;
      dailyStats[date].articles += 1;
    });
    
    const performanceData = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      views: stats.views,
      likes: stats.likes,
      shares: stats.shares,
      articles: stats.articles
    }));
    
    res.json({
      success: true,
      period,
      data: performanceData
    });
    
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance data',
      error: error.message
    });
  }
};

export {
  getDashboardStats,
  getArticleAnalytics,
  getTrendingArticles,
  getPerformanceOverTime
};