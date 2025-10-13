import mongoose from 'mongoose';
import Article from '../models/Article.js';
import Admin from '../models/Admin.js';
import { logger } from '../middleware/errorHandler.js';

export const createIndexes = async () => {
  try {
    logger.info('Creating database indexes...');

    try {
      await Article.collection.dropIndexes();
      logger.info('Dropped all existing indexes');
    } catch (error) {
      logger.warn('Error dropping indexes:', error.message);
    }

    await Article.collection.createIndex(
      { title: 'text', content: 'text', tags: 'text' },
      { 
        name: 'article_text_search',
        weights: {
          title: 10,
          content: 5,
          tags: 3
        },
        default_language: 'english',
        background: true
      }
    );

    const indexes = [
      { fields: { category: 1, status: 1 }, options: { name: 'article_category_status' } },
      { fields: { region: 1, status: 1 }, options: { name: 'article_region_status' } },
      { fields: { category: 1, region: 1, status: 1 }, options: { name: 'article_category_region_status' } },
      { fields: { createdAt: -1 }, options: { name: 'article_created_at' } },
      { fields: { publishedAt: -1 }, options: { name: 'article_published_at' } },
      { fields: { views: -1, likes: -1, shares: -1 }, options: { name: 'article_engagement_metrics' } },
      { fields: { 'metadata.aiGenerated': 1 }, options: { name: 'article_ai_generated' } },
      { fields: { 'metadata.aiProvider': 1 }, options: { name: 'article_ai_provider' } },
      { fields: { status: 1, createdAt: -1 }, options: { name: 'article_status_created' } }
    ];

    for (const index of indexes) {
      try {
        await Article.collection.createIndex(index.fields, index.options);
        logger.info(`Created index: ${index.options.name}`);
      } catch (error) {
        logger.warn(`Error creating index ${index.options.name}:`, error.message);
      }
    }

    try {
      await Admin.collection.createIndex({ email: 1 }, { unique: true });
      await Admin.collection.createIndex({ isActive: 1 });
      logger.info('Created admin indexes');
    } catch (error) {
      logger.warn('Error creating admin indexes:', error.message);
    }

    logger.info('✅ Database indexes created successfully');
  } catch (error) {
    logger.error('❌ Error creating database indexes:', error);

  }
};


export const checkDatabaseHealth = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    const articleCount = await Article.countDocuments();
    
    return {
      status: 'healthy',
      adminCount,
      articleCount,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};


export const monitorConnection = () => {
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });
};

