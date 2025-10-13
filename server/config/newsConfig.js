

const config = {
 
  sources: {
    newsapi: {
      enabled: true,
      priority: 1,  
      articlesPerRequest: 50
    },
    gnews: {
      enabled: true,
      priority: 2,
      articlesPerRequest: 10
    },
    newsdata: {
      enabled: true,
      priority: 2,
      articlesPerRequest: 10
    },
    guardian: {
      enabled: true,
      priority: 3,
      articlesPerRequest: 20
    },
    currents: {
      enabled: true,
      priority: 2,
      articlesPerRequest: 10
    }
  },

 
  deduplication: {
    enabled: true,
    similarityThreshold: 0.8 
  },

 
  filtering: {
    requireImage: false,      
    requireDescription: true,  
    minTitleLength: 10        
  },

  performance: {
    timeout: 10000,      
    parallelFetch: true,   
    maxArticles: 100      
  }
};

export default config;
