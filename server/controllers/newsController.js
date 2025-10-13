import axios from "axios";
import { aggregateNews } from "../utils/newsAggregator.js";


const getTunisiaNews = async (req, res) => {
  try {
    const { pageSize = 100 } = req.query;
    
    console.log('Fetching Tunisia news from multiple sources...');
    
  
    const result = await aggregateNews('Tunisia', {
      maxArticles: parseInt(pageSize),
      deduplicate: true,
      sortBy: 'publishedAt'
    });
    
    res.json({
      ...result,
      source: 'multi-source',
      region: 'tunisia'
    });
    
  } catch (error) {
    console.error("Tunisia news fetch error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch Tunisia news" 
    });
  }
};


const getMenaNews = async (req, res) => {
  try {
    const { pageSize = 100 } = req.query;
    
    console.log('Fetching MENA news from multiple sources...');
    
  
    const result = await aggregateNews('Middle East OR North Africa OR MENA', {
      maxArticles: parseInt(pageSize),
      deduplicate: true,
      sortBy: 'publishedAt'
    });
    
    res.json({
      ...result,
      source: 'multi-source',
      region: 'mena'
    });
    
  } catch (error) {
    console.error("MENA news fetch error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch MENA news" 
    });
  }
};


const getPopularNews = async (req, res) => {
  try {
    const { pageSize = 100 } = req.query;
    
    console.log('Fetching popular news from multiple sources...');
    
    const result = await aggregateNews('breaking news OR top stories', {
      maxArticles: parseInt(pageSize),
      deduplicate: true,
      sortBy: 'publishedAt'
    });
    
    res.json({
      ...result,
      source: 'multi-source',
      type: 'popular'
    });
    
  } catch (error) {
    console.error("Popular news fetch error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch popular news" 
    });
  }
};


const getWorldNews = async (req, res) => {
  try {
    const { pageSize = 100 } = req.query;
    
    console.log('Fetching world news from multiple sources...');
    
   
    const result = await aggregateNews('world news OR international', {
      maxArticles: parseInt(pageSize),
      deduplicate: true,
      sortBy: 'publishedAt'
    });
    
    res.json({
      ...result,
      source: 'multi-source',
      region: 'world'
    });
    
  } catch (error) {
    console.error("World news fetch error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch world news" 
    });
  }
};


const getNewsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { pageSize = 100 } = req.query;
    
    console.log(`📂 Fetching ${category} news from multiple sources...`);
    
   
    const categoryQueries = {
      'business': 'business OR finance OR economy',
      'entertainment': 'entertainment OR celebrity OR movies',
      'health': 'health OR medical OR wellness',
      'science': 'science OR research OR technology',
      'sports': 'sports OR football OR basketball',
      'tech': 'technology OR tech OR innovation',
      'technology': 'technology OR tech OR innovation',
      'politics': 'politics OR government OR election',
      'education': 'education OR school OR university',
      'environment': 'environment OR climate OR sustainability',
      'general': 'news OR headlines'
    };
    
    const query = categoryQueries[category.toLowerCase()] || category;
    
  
    const result = await aggregateNews(query, {
      maxArticles: parseInt(pageSize),
      deduplicate: true,
      category: category.toLowerCase(),
      sortBy: 'publishedAt'
    });
    
    res.json({
      ...result,
      category: category,
      source: 'multi-source'
    });
    
  } catch (error) {
    console.error("Category news fetch error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch category news" 
    });
  }
};


const searchNews = async (req, res) => {
  try {
    const { q, sortBy = 'publishedAt', pageSize = 100 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query 'q' is required"
      });
    }
    
    console.log(`Searching news for "${q}" from multiple sources...`);
    

    const result = await aggregateNews(q, {
      maxArticles: parseInt(pageSize),
      deduplicate: true,
      sortBy
    });
    
    res.json({
      ...result,
      query: q,
      source: 'multi-source'
    });
    
  } catch (error) {
    console.error("Search news error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to search news" 
    });
  }
};

export {
  getTunisiaNews,
  getMenaNews,
  getPopularNews,
  getWorldNews,
  getNewsByCategory,
  searchNews
};