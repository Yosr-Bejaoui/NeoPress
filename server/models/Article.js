import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: true,
    enum: [
      'Technology',
      'Health & Wellness', 
      'Business & Finance',
      'Politics',
      'Sports',
      'Entertainment',
      'Science',
      'Education',
      'Environment',
      'Culture & Arts',
      'Travel',
      'Food & Dining',
      'Fashion & Style',
      'Automotive',
      'Real Estate',
      'Lifestyle',
      'Opinion & Analysis'
    ]
  },
  region: {
    type: String,
    required: true,
    enum: [
      'Local',
      'National',
      'MENA',
      'Europe',
      'Asia',
      'Africa',
      'North America',
      'South America',
      'Australia & Oceania',
      'International'
    ],
    default: 'International'
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected'],
    default: 'draft'
  },
  
 
  image: {
    type: String, 
    trim: true
  },
  images: [{
    url: String,
    caption: String,
    alt: String
  }],
  

  sourceUrl: {
    type: String, 
    trim: true
  },
  sourceName: {
    type: String, 
    trim: true
  },
  publishedAt: {
    type: Date 
  },
  

  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  

  metadata: {
    aiGenerated: {
      type: Boolean,
      default: false
    },
    aiProvider: {
      type: String,
      enum: ['gemini', 'openai', 'claude'],
      default: 'gemini'
    },
    originalNewsTitle: String,
    generationSettings: {
      tone: {
        type: String,
        enum: ['neutral', 'formal', 'casual', 'analytical', 'engaging'],
        default: 'neutral'
      },
      language: {
        type: String,
        default: 'en'
      },
      category: String
    },
    regenerationCount: {
      type: Number,
      default: 0
    },
    lastRegeneratedAt: Date
  },
  
  
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['article', 'video', 'document', 'website'],
      default: 'article'
    }
  }],
  
 
  metaDescription: String,
  metaKeywords: [String],
  slug: {
    type: String,
    index: {
      unique: true,
      sparse: true,
      name: 'article_slug'  
    }
  },
  

  author: {
    name: {
      type: String,
      default: 'AI Assistant'
    },
    email: String,
    role: {
      type: String,
      default: 'AI Writer'
    }
  },
  
 
  reviewedBy: {
    name: String,
    email: String,
    reviewedAt: Date
  },
  approvedBy: {
    name: String,
    email: String,
    approvedAt: Date
  },
  

  analytics: {
    readTime: Number, 
    wordCount: Number,
    engagement: {
      comments: { type: Number, default: 0 },
      reactions: { type: Number, default: 0 }
    }
  }
}, {
  timestamps: true
});


articleSchema.pre('save', async function(next) {
  if (this.isModified('title') && !this.slug) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existing = await this.constructor.findOne({ slug });
      if (!existing) break;
      
      slug = `${baseSlug}-${Date.now()}`;
      break; 
    }
    
    this.slug = slug;
  }
  

  if (this.isModified('content')) {
    this.analytics.wordCount = this.content.split(/\s+/).length;
    this.analytics.readTime = Math.ceil(this.analytics.wordCount / 200);
  }
  
  next();
});


articleSchema.index({ title: 'text', content: 'text', tags: 'text' });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ region: 1, status: 1 });
articleSchema.index({ category: 1, region: 1, status: 1 });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ slug: 1 });


articleSchema.virtual('url').get(function() {
  return `/articles/${this.slug || this._id}`;
});


articleSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

articleSchema.methods.updateEngagement = function(type, value = 1) {
  if (this.analytics.engagement[type] !== undefined) {
    this.analytics.engagement[type] += value;
  }
  return this.save();
};


articleSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'published' })
    .sort({ createdAt: -1 });
};

articleSchema.statics.findByRegion = function(region) {
  return this.find({ region, status: 'published' })
    .sort({ createdAt: -1 });
};

articleSchema.statics.findTrending = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ views: -1, likes: -1, shares: -1 })
    .limit(limit);
};

articleSchema.statics.searchArticles = async function(query, options = {}) {
  try {
    if (!query || typeof query !== 'string') {
      return this.find({ status: options.status || 'published' })
        .sort({ createdAt: -1 })
        .limit(options.limit || 20);
    }

    const searchTerms = query.trim().split(/\s+/);
    const escapedTerms = searchTerms.map(term => term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    
  
    const baseQuery = {
      status: options.status || 'published'
    };


    if (options.category) {
      baseQuery.category = options.category;
    }
    
    if (options.region) {
      baseQuery.region = options.region;
    }


    const textSearchQuery = {
      ...baseQuery,
      $text: { $search: query }
    };

    try {
      const textResults = await this.find(textSearchQuery)
        .sort({ 
          score: { $meta: 'textScore' } 
        })
        .limit(options.limit || 20)
        .lean();

      if (textResults.length > 0) {
        console.log('Found results using text search');
        return textResults;
      }
    } catch (error) {
      console.log('Text search failed, falling back to regex:', error.message);
    }

    console.log('Performing regex search');
    const regexPattern = escapedTerms.join('|');
    const regexSearchQuery = {
      ...baseQuery,
      $or: [
        { title: { $regex: regexPattern, $options: 'i' } },
        { content: { $regex: regexPattern, $options: 'i' } },
        { tags: { $regex: regexPattern, $options: 'i' } }
      ]
    };

    return this.find(regexSearchQuery)
      .sort({ createdAt: -1 })
      .limit(options.limit || 20)
      .lean();

  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export default mongoose.model('Article', articleSchema);