import axios from 'axios';

const getNewsSources = () => ({
  newsapi: {
    name: 'NewsAPI',
    baseUrl: 'https://newsapi.org/v2',
    enabled: true,
    apiKey: process.env.NEWSAPI_API_KEY,
    rateLimit: { requests: 100, window: 'day' }
  },
  gnews: {
    name: 'GNews',
    baseUrl: 'https://gnews.io/api/v4',
    enabled: true,
    apiKey: process.env.GNEWS_API_KEY,
    rateLimit: { requests: 100, window: 'day' }
  },
  newsdata: {
    name: 'NewsData.io',
    baseUrl: 'https://newsdata.io/api/1',
    enabled: true,
    apiKey: process.env.NEWSDATA_API_KEY,
    rateLimit: { requests: 200, window: 'day' }
  },
  guardian: {
    name: 'The Guardian',
    baseUrl: 'https://content.guardianapis.com',
    enabled: true,
    apiKey: process.env.GUARDIAN_API_KEY,
    rateLimit: { requests: 500, window: 'day' }
  },
  currents: {
    name: 'Currents API',
    baseUrl: 'https://api.currentsapi.services/v1',
    enabled: true,
    apiKey: process.env.CURRENTS_API_KEY,
    rateLimit: { requests: 600, window: 'day' }
  }
});


const normalizeArticle = (article, source) => {
  switch (source) {
    case 'newsapi':
      return {
        title: article.title,
        description: article.description,
        summary: article.description,
        content: article.content,
        url: article.url,
        link: article.url,
        urlToImage: article.urlToImage,
        imageUrl: article.urlToImage,
        publishedAt: article.publishedAt,
        createdAt: article.publishedAt,
        source: {
          name: article.source?.name || 'NewsAPI'
        },
        sourceName: article.source?.name || 'NewsAPI',
        author: article.author,
        apiSource: 'newsapi'
      };

    case 'gnews':
      return {
        title: article.title,
        description: article.description,
        summary: article.description,
        content: article.content,
        url: article.url,
        link: article.url,
        urlToImage: article.image,
        imageUrl: article.image,
        publishedAt: article.publishedAt,
        createdAt: article.publishedAt,
        source: {
          name: article.source?.name || 'GNews'
        },
        sourceName: article.source?.name || 'GNews',
        author: article.source?.name,
        apiSource: 'gnews'
      };

    case 'newsdata':
      return {
        title: article.title,
        description: article.description,
        summary: article.description,
        content: article.content || article.description,
        url: article.link,
        link: article.link,
        urlToImage: article.image_url,
        imageUrl: article.image_url,
        publishedAt: article.pubDate,
        createdAt: article.pubDate,
        source: {
          name: article.source_id || 'NewsData'
        },
        sourceName: article.source_id || 'NewsData',
        author: article.creator?.[0] || article.source_id,
        apiSource: 'newsdata'
      };

    case 'guardian':
      return {
        title: article.webTitle,
        description: article.fields?.trailText || article.webTitle,
        summary: article.fields?.trailText || article.webTitle,
        content: article.fields?.bodyText || article.fields?.trailText,
        url: article.webUrl,
        link: article.webUrl,
        urlToImage: article.fields?.thumbnail,
        imageUrl: article.fields?.thumbnail,
        publishedAt: article.webPublicationDate,
        createdAt: article.webPublicationDate,
        source: {
          name: 'The Guardian'
        },
        sourceName: 'The Guardian',
        author: article.fields?.byline,
        apiSource: 'guardian'
      };

    case 'currents':
      return {
        title: article.title,
        description: article.description,
        summary: article.description,
        content: article.description,
        url: article.url,
        link: article.url,
        urlToImage: article.image,
        imageUrl: article.image,
        publishedAt: article.published,
        createdAt: article.published,
        source: {
          name: 'Currents API'
        },
        sourceName: 'Currents API',
        author: article.author?.[0],
        apiSource: 'currents'
      };

    default:
      return article;
  }
};


const fetchFromNewsAPI = async (query, options = {}) => {
  const { pageSize = 50, category, sortBy = 'publishedAt' } = options;
  const NEWS_SOURCES = getNewsSources();
  const apiKey = NEWS_SOURCES.newsapi.apiKey;
  
  if (!apiKey) {
    console.log('NewsAPI key not configured, skipping...');
    return [];
  }

  try {
    let url;
    if (category) {
      url = `${NEWS_SOURCES.newsapi.baseUrl}/top-headlines?category=${category}&language=en&pageSize=${pageSize}&apiKey=${apiKey}`;
    } else if (query) {
      url = `${NEWS_SOURCES.newsapi.baseUrl}/everything?q=${encodeURIComponent(query)}&language=en&sortBy=${sortBy}&pageSize=${pageSize}&apiKey=${apiKey}`;
    } else {
      url = `${NEWS_SOURCES.newsapi.baseUrl}/top-headlines?language=en&pageSize=${pageSize}&apiKey=${apiKey}`;
    }

    console.log('Fetching from NewsAPI...');
    const response = await axios.get(url, { timeout: 10000 });
    
    const articles = (response.data.articles || []).map(article => 
      normalizeArticle(article, 'newsapi')
    );
    
    console.log(`✅ NewsAPI: ${articles.length} articles`);
    return articles;
  } catch (error) {
    console.error('❌ NewsAPI error:', error.response?.data?.message || error.message);
    return [];
  }
};


const fetchFromGNews = async (query, options = {}) => {
  const { pageSize = 10, category } = options;
  const NEWS_SOURCES = getNewsSources();
  const apiKey = NEWS_SOURCES.gnews.apiKey;
  
  if (!apiKey) {
    console.log('GNews API key not configured, skipping...');
    return [];
  }

  try {
    let url;
    if (category) {
      url = `${NEWS_SOURCES.gnews.baseUrl}/top-headlines?category=${category}&lang=en&max=${pageSize}&apikey=${apiKey}`;
    } else if (query) {
      url = `${NEWS_SOURCES.gnews.baseUrl}/search?q=${encodeURIComponent(query)}&lang=en&max=${pageSize}&apikey=${apiKey}`;
    } else {
      url = `${NEWS_SOURCES.gnews.baseUrl}/top-headlines?lang=en&max=${pageSize}&apikey=${apiKey}`;
    }

    console.log('Fetching from GNews...');
    const response = await axios.get(url, { timeout: 10000 });
    
    const articles = (response.data.articles || []).map(article => 
      normalizeArticle(article, 'gnews')
    );
    
    console.log(`✅ GNews: ${articles.length} articles`);
    return articles;
  } catch (error) {
    console.error('❌ GNews error:', error.response?.data?.message || error.message);
    return [];
  }
};


const fetchFromNewsData = async (query, options = {}) => {
  const { pageSize = 10, category } = options;
  const NEWS_SOURCES = getNewsSources();
  const apiKey = NEWS_SOURCES.newsdata.apiKey;
  
  if (!apiKey) {
    console.log('NewsData.io API key not configured, skipping...');
    return [];
  }

  try {
    let url;
    if (category) {
      url = `${NEWS_SOURCES.newsdata.baseUrl}/news?apikey=${apiKey}&language=en&category=${category}&size=${pageSize}`;
    } else if (query) {
      url = `${NEWS_SOURCES.newsdata.baseUrl}/news?apikey=${apiKey}&language=en&q=${encodeURIComponent(query)}&size=${pageSize}`;
    } else {
      url = `${NEWS_SOURCES.newsdata.baseUrl}/news?apikey=${apiKey}&language=en&size=${pageSize}`;
    }

    console.log('Fetching from NewsData.io...');
    const response = await axios.get(url, { timeout: 10000 });
    
    const articles = (response.data.results || []).map(article => 
      normalizeArticle(article, 'newsdata')
    );
    
    console.log(`✅ NewsData.io: ${articles.length} articles`);
    return articles;
  } catch (error) {
    console.error('❌ NewsData.io error:', error.response?.data?.message || error.message);
    return [];
  }
};


const fetchFromGuardian = async (query, options = {}) => {
  const { pageSize = 20 } = options;
  const NEWS_SOURCES = getNewsSources();
  const apiKey = NEWS_SOURCES.guardian.apiKey;
  
  if (!apiKey) {
    console.log('Guardian API key not configured, skipping...');
    return [];
  }

  try {
    const searchQuery = query || 'news';
    const url = `${NEWS_SOURCES.guardian.baseUrl}/search?q=${encodeURIComponent(searchQuery)}&page-size=${pageSize}&show-fields=trailText,thumbnail,bodyText,byline&api-key=${apiKey}`;

    console.log('Fetching from The Guardian...');
    const response = await axios.get(url, { timeout: 10000 });
    
    const articles = (response.data.response?.results || []).map(article => 
      normalizeArticle(article, 'guardian')
    );
    
    console.log(`✅ Guardian: ${articles.length} articles`);
    return articles;
  } catch (error) {
    console.error('❌ Guardian error:', error.response?.data?.message || error.message);
    return [];
  }
};


const fetchFromCurrents = async (query, options = {}) => {
  const { pageSize = 10, category } = options;
  const NEWS_SOURCES = getNewsSources();
  const apiKey = NEWS_SOURCES.currents.apiKey;
  
  if (!apiKey) {
    console.log('⚠️  Currents API key not configured, skipping...');
    return [];
  }

  try {
    let url;
    if (query) {
      url = `${NEWS_SOURCES.currents.baseUrl}/search?keywords=${encodeURIComponent(query)}&language=en&apiKey=${apiKey}`;
    } else {
      url = `${NEWS_SOURCES.currents.baseUrl}/latest-news?language=en&apiKey=${apiKey}`;
    }

    console.log('Fetching from Currents API...');
    const response = await axios.get(url, { timeout: 10000 });
    
    const articles = (response.data.news || []).map(article => 
      normalizeArticle(article, 'currents')
    );
    
    console.log(`✅ Currents: ${articles.length} articles`);
    return articles;
  } catch (error) {
    console.error('❌ Currents error:', error.response?.data?.message || error.message);
    return [];
  }
};


const deduplicateArticles = (articles) => {
  const seen = new Map();
  const unique = [];

  for (const article of articles) {
    if (!article.title) continue;
    
    const normalizedTitle = article.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();
    
    let isDuplicate = false;
    for (const [seenTitle] of seen) {
      const similarity = calculateSimilarity(normalizedTitle, seenTitle);
      if (similarity > 0.8) { 
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      seen.set(normalizedTitle, true);
      unique.push(article);
    }
  }

  return unique;
};


const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};


const levenshteinDistance = (str1, str2) => {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};


export const aggregateNews = async (query, options = {}) => {
  const {
    sources = ['newsapi', 'gnews', 'newsdata', 'guardian', 'currents'],
    maxArticles = 100,
    deduplicate = true,
    category,
    sortBy = 'publishedAt'
  } = options;

  console.log('Starting multi-source news aggregation...');
  console.log(`Query: "${query || 'general'}", Sources: ${sources.join(', ')}`);

  const NEWS_SOURCES = getNewsSources();

  console.log('API Keys status:', {
    newsapi: !!NEWS_SOURCES.newsapi.apiKey,
    gnews: !!NEWS_SOURCES.gnews.apiKey,
    newsdata: !!NEWS_SOURCES.newsdata.apiKey,
    guardian: !!NEWS_SOURCES.guardian.apiKey,
    currents: !!NEWS_SOURCES.currents.apiKey
  });

  const fetchPromises = [];
  
  if (sources.includes('newsapi') && NEWS_SOURCES.newsapi.apiKey) {
    console.log('Adding NewsAPI to fetch queue');
    fetchPromises.push(fetchFromNewsAPI(query, { ...options, pageSize: 50 }));
  }
  
  if (sources.includes('gnews') && NEWS_SOURCES.gnews.apiKey) {
    console.log('Adding GNews to fetch queue');
    fetchPromises.push(fetchFromGNews(query, { ...options, pageSize: 10 }));
  }
  
  if (sources.includes('newsdata') && NEWS_SOURCES.newsdata.apiKey) {
    console.log('Adding NewsData to fetch queue');
    fetchPromises.push(fetchFromNewsData(query, { ...options, pageSize: 10 }));
  }
  
  if (sources.includes('guardian') && NEWS_SOURCES.guardian.apiKey) {
    console.log('Adding Guardian to fetch queue');
    fetchPromises.push(fetchFromGuardian(query, { ...options, pageSize: 20 }));
  }
  
  if (sources.includes('currents') && NEWS_SOURCES.currents.apiKey) {
    console.log('Adding Currents to fetch queue');
    fetchPromises.push(fetchFromCurrents(query, { ...options, pageSize: 10 }));
  }

  console.log(`Total fetch promises: ${fetchPromises.length}`);

  const results = await Promise.allSettled(fetchPromises);
  
  console.log(`Promise results:`, results.map((r, i) => ({
    index: i,
    status: r.status,
    hasValue: r.status === 'fulfilled' && Array.isArray(r.value),
    articleCount: r.status === 'fulfilled' && Array.isArray(r.value) ? r.value.length : 0,
    error: r.status === 'rejected' ? r.reason?.message : undefined
  })));
  
  let allArticles = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      allArticles = allArticles.concat(result.value);
    } else if (result.status === 'rejected') {
      console.error(`❌ Promise ${index} rejected:`, result.reason);
    }
  });

  console.log(`Total articles fetched: ${allArticles.length}`);

  if (deduplicate) {
    allArticles = deduplicateArticles(allArticles);
    console.log(`🔍 After deduplication: ${allArticles.length} unique articles`);
  }

  allArticles = allArticles.filter(article => 
    article.title && 
    article.title.length > 10 &&
    (article.description || article.summary)
  );

  allArticles.sort((a, b) => {
    const dateA = new Date(a.publishedAt || a.createdAt);
    const dateB = new Date(b.publishedAt || b.createdAt);
    return dateB - dateA; 
  });

  const finalArticles = allArticles.slice(0, maxArticles);

  console.log(`✅ Returning ${finalArticles.length} articles`);
  
  return {
    success: true,
    totalArticles: finalArticles.length,
    articles: finalArticles,
    sources: sources.filter(s => NEWS_SOURCES[s]?.apiKey),
    query: query || 'general'
  };
};

export default aggregateNews;
