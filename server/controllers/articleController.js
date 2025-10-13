import Article from "../models/Article.js";
import { generateArticle as generateWithGemini } from "../utils/gemini.js";


export const getArticles = async (req, res) => {
  try {
    console.log('📄 Fetching articles from database...');
    
   
    const { category, region, status = 'all', limit } = req.query;

    const filterQuery = {};
    

    if (status && status !== 'all' && status !== 'All') {
      filterQuery.status = status;
    }
    
    if (category && category !== 'All' && category !== 'all') {
      filterQuery.category = category;
    }
    if (region && region !== 'all') {
      filterQuery.region = region;
    }
    
    console.log('🔍 Filter query:', filterQuery);
    
    let query = Article.find(filterQuery)
      .sort({ createdAt: -1 });
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const articles = await query.lean(); 
    
    console.log(`✅ Found ${articles.length} articles in database`);
    
    
    const transformedArticles = articles.map(article => ({
      id: article._id.toString(),
      title: article.title,
      content: article.content,
      summary: article.summary || (article.content ? article.content.substring(0, 200) + '...' : 'No summary available'),
      status: article.status || 'draft',
      category: article.category, 
      region: article.region || 'International',
      tags: article.tags || [],
      image: article.image,
      sourceUrl: article.sourceUrl,
      sourceName: article.sourceName,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      publishedAt: article.publishedAt,
      views: article.views || 0,
      likes: article.likes || 0,
      shares: article.shares || 0,
      confidence: article.metadata?.confidence || '95%',
      metadata: article.metadata,
      author: article.author,
      analytics: article.analytics
    }));

   
    res.json({
      success: true,
      articles: transformedArticles,
      count: transformedArticles.length,
      filters: {
        category: category || 'All',
        region: region || 'all',
        status
      },
      message: `Retrieved ${transformedArticles.length} articles`
    });

  } catch (err) {
    console.error('❌ Error fetching articles:', err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching articles from database",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};



export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📄 Fetching article with ID: ${id}`);
    
    const article = await Article.findById(id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }

   
    await article.incrementViews();

    
    const transformedArticle = {
      id: article._id.toString(),
      title: article.title,
      content: article.content,
      summary: article.summary || (article.content ? article.content.substring(0, 200) + '...' : 'No summary available'),
      status: article.status || 'draft',
      category: article.category,
      tags: article.tags || [],
      image: article.image,
      sourceUrl: article.sourceUrl,
      sourceName: article.sourceName,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      publishedAt: article.publishedAt,
      views: article.views || 0,
      likes: article.likes || 0,
      shares: article.shares || 0,
      confidence: article.metadata?.confidence || '95%',
      metadata: article.metadata,
      author: article.author,
      analytics: article.analytics,
      url: article.url
    };

    res.json({
      success: true,
      article: transformedArticle
    });

  } catch (err) {
    console.error('❌ Error fetching article:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching article",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};



export const searchArticles = async (req, res) => {
  try {
    const { q: query, category, limit = 20, status = 'published', region } = req.query;
    
    console.log('🔍 Search request:', {
      query,
      category,
      region,
      status,
      limit
    });
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    console.log(`🔍 Searching articles for: "${query}"`);
    
    const articles = await Article.searchArticles(query, {
      category,
      region,
      limit: parseInt(limit),
      status
    });

    console.log(`✅ Found ${articles.length} articles`);

    const transformedArticles = articles.map(article => ({
      id: article._id.toString(),
      title: article.title,
      summary: article.summary || (article.content ? article.content.substring(0, 200) + '...' : 'No summary available'),
      category: article.category,
      region: article.region,
      tags: article.tags || [],
      image: article.image,
      content: article.content,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      publishedAt: article.publishedAt,
      views: article.views || 0,
      likes: article.likes || 0,
      shares: article.shares || 0,
      url: article.url,
      searchScore: article.score 
    }));

    console.log('✅ Transformed articles for response');

    res.json({
      success: true,
      articles: transformedArticles,
      count: transformedArticles.length,
      query,
      filters: {
        category,
        region,
        status
      },
      message: `Found ${transformedArticles.length} articles matching "${query}"`
    });

  } catch (err) {
    console.error('❌ Error searching articles:', err);
    let errorMessage = "Error searching articles";
    
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
      errorMessage = "Database error while searching articles";
    } else if (err.message.includes('text index')) {
      errorMessage = "Search index not ready. Please try again in a few moments.";
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};




export const getArticlesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;
    
    console.log(`Fetching articles for category: ${category}`);
    
    const articles = await Article.findByCategory(category).limit(parseInt(limit));
    
    const transformedArticles = articles.map(article => ({
      id: article._id.toString(),
      title: article.title,
      summary: article.summary || (article.content ? article.content.substring(0, 200) + '...' : 'No summary available'),
      category: article.category,
      region: article.region,
      tags: article.tags || [],
      image: article.image,
      createdAt: article.createdAt,
      views: article.views || 0,
      url: article.url
    }));

    res.json({
      success: true,
      articles: transformedArticles,
      count: transformedArticles.length,
      category,
      message: `Found ${transformedArticles.length} articles in ${category} category`
    });

  } catch (err) {
    console.error('❌ Error fetching articles by category:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching articles by category",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const getArticlesByRegion = async (req, res) => {
  try {
    const { region } = req.params;
    const { limit = 20 } = req.query;
    
    console.log(`Fetching articles for region: ${region}`);
    
    const articles = await Article.findByRegion(region).limit(parseInt(limit));
    
    const transformedArticles = articles.map(article => ({
      id: article._id.toString(),
      title: article.title,
      summary: article.summary || (article.content ? article.content.substring(0, 200) + '...' : 'No summary available'),
      category: article.category,
      region: article.region,
      tags: article.tags || [],
      image: article.image,
      createdAt: article.createdAt,
      views: article.views || 0,
      url: article.url
    }));

    res.json({
      success: true,
      articles: transformedArticles,
      count: transformedArticles.length,
      region,
      message: `Found ${transformedArticles.length} articles in ${region} region`
    });

  } catch (err) {
    console.error('❌ Error fetching articles by region:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching articles by region",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};




export const getTrendingArticles = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    console.log('Fetching trending articles...');
    
    const articles = await Article.findTrending(parseInt(limit));
    
    const transformedArticles = articles.map(article => ({
      id: article._id.toString(),
      title: article.title,
      summary: article.summary || (article.content ? article.content.substring(0, 200) + '...' : 'No summary available'),
      category: article.category,
      tags: article.tags || [],
      image: article.image,
      createdAt: article.createdAt,
      views: article.views || 0,
      likes: article.likes || 0,
      shares: article.shares || 0,
      url: article.url
    }));

    res.json({
      success: true,
      articles: transformedArticles,
      count: transformedArticles.length,
      message: `Retrieved ${transformedArticles.length} trending articles`
    });

  } catch (err) {
    console.error('❌ Error fetching trending articles:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching trending articles",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};




export const createArticle = async (req, res) => {
  try {
    console.log('Creating new article:', req.body.title);
    
    const articleData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const article = await Article.create(articleData);
    console.log('✅ Article created successfully:', article._id);
    
  
    const transformedArticle = {
      id: article._id.toString(),
      ...article.toObject(),
      summary: article.summary || (article.content ? article.content.substring(0, 200) + '...' : 'No summary available')
    };
    
    res.status(201).json({
      success: true,
      message: "Article created successfully",
      article: transformedArticle
    });
    
  } catch (err) {
    console.error('❌ Error creating article:', err);
    res.status(400).json({ 
      success: false,
      message: "Failed to create article",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};




export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Updating article: ${id}`);
    console.log(`Request body:`, req.body);
    
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    console.log(`Final update data:`, updateData);

    
    const validCategories = [
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
    ];
    
    if (updateData.category && !validCategories.includes(updateData.category)) {
      console.log(`⚠️ Invalid category "${updateData.category}" provided`);
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    if (updateData.status === 'published') {
      updateData.publishedAt = new Date();
    } else if (updateData.status === 'rejected') {
      updateData.publishedAt = null;
    }
  
    if (updateData.status === 'approved') {
      updateData.status = 'published';
    }
    
    const article = await Article.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }
    
    console.log('✅ Article updated successfully');
    
  
    const transformedArticle = {
      id: article._id.toString(),
      ...article.toObject(),
      summary: article.summary || (article.content ? article.content.substring(0, 200) + '...' : 'No summary available')
    };
    
    res.json({
      success: true,
      message: "Article updated successfully",
      article: transformedArticle
    });
    
  } catch (err) {
    console.error('❌ Error updating article:', err);
    res.status(400).json({ 
      success: false,
      message: "Failed to update article",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};




export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting article: ${id}`);
    
    const article = await Article.findByIdAndDelete(id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }
    
    console.log('✅ Article deleted successfully');
    
    res.json({ 
      success: true,
      message: "Article deleted successfully" 
    });
    
  } catch (err) {
    console.error('❌ Error deleting article:', err);
    res.status(400).json({ 
      success: false,
      message: "Error deleting article",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const updateEngagement = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, value = 1 } = req.body; 
    
    console.log(`Updating ${type} for article: ${id}`);
    
    const article = await Article.findById(id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }

  
    if (type === 'likes') {
      article.likes += value;
    } else if (type === 'shares') {
      article.shares += value;
    } else if (['comments', 'reactions'].includes(type)) {
      await article.updateEngagement(type, value);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid engagement type. Use: likes, shares, comments, or reactions"
      });
    }

    await article.save();
    
    res.json({
      success: true,
      message: `${type} updated successfully`,
      engagement: {
        likes: article.likes,
        shares: article.shares,
        comments: article.analytics.engagement.comments,
        reactions: article.analytics.engagement.reactions
      }
    });
    
  } catch (err) {
    console.error('❌ Error updating engagement:', err);
    res.status(400).json({
      success: false,
      message: "Error updating engagement",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


export const incrementViews = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }
    await article.incrementViews();
    return res.json({ success: true, views: article.views });
  } catch (err) {
    console.error('❌ Error incrementing views:', err);
    return res.status(400).json({ success: false, message: "Error incrementing views" });
  }
};

export const generateArticle = async (req, res) => {
  try {
    const { 
      title, 
      summary, 
      category, 
      region = "International",
      language = "en", 
      tone = "neutral",
      sourceImage,
      sourceUrl,
      publishedAt,
      sourceName
    } = req.body;

   
    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: "Title is required for article generation" 
      });
    }

    if (!category) {
      return res.status(400).json({ 
        success: false, 
        message: "Category is required" 
      });
    }

    if (!region) {
      return res.status(400).json({ 
        success: false, 
        message: "Region is required" 
      });
    }

   
    const validCategories = [
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
    ];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    const validRegions = [
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
    ];
    
    if (!validRegions.includes(region)) {
      return res.status(400).json({
        success: false,
        message: `Invalid region. Must be one of: ${validRegions.join(', ')}`
      });
    }

    
    const generationPrompt = createNewsBasedPrompt({
      title,
      summary,
      category,
      tone,
      language,
      sourceName,
      publishedAt
    });

    console.log("Generating article with Gemini...");
    console.log("Prompt length:", generationPrompt.length);
    console.log("Prompt preview:", generationPrompt.substring(0, 200) + "...");

    let generatedContent;
    try {
      generatedContent = await generateWithGemini(generationPrompt);
      console.log("✅ Gemini response received, length:", generatedContent ? generatedContent.length : 0);

      if (!generatedContent) {
        console.error("❌ Gemini returned empty response");
        return res.status(500).json({
          success: false,
          message: "Failed to generate article content"
        });
      }
    } catch (geminiError) {
      console.error("❌ Gemini API Error:", geminiError);
      
      if (geminiError.message.includes('GEMINI_API_KEY')) {
        return res.status(500).json({
          success: false,
          message: "AI service not configured. Please check your environment variables."
        });
      }
      
      return res.status(500).json({
        success: false,
        message: "Failed to generate article content. Please try again."
      });
    }

   
    console.log("Raw Gemini response:", generatedContent.substring(0, 200) + "...");
    const structuredContent = parseGeminiResponse(generatedContent, title);
    console.log("Parsed content preview:", {
      title: structuredContent.title,
      contentLength: structuredContent.content?.length,
      contentPreview: structuredContent.content?.substring(0, 100) + "...",
      tags: structuredContent.tags
    });

    
    const articleData = {
      title: structuredContent.title || title,
      content: structuredContent.content,
      summary: structuredContent.summary || (structuredContent.content ? structuredContent.content.substring(0, 200) + '...' : summary),
      tags: structuredContent.tags || [],
      status: "draft",
      category,
      region,
      image: sourceImage,
      sourceUrl: sourceUrl,
      sourceName: sourceName,
      publishedAt: null, 
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        aiGenerated: true,
        aiProvider: "gemini",
        originalNewsTitle: title,
        generationSettings: {
          tone,
          language,
          category,
          region
        }
      }
    };

    console.log('Saving article to database...');
    console.log('Article data preview:', {
      title: articleData.title,
      category: articleData.category,
      region: articleData.region,
      contentLength: articleData.content ? articleData.content.length : 0
    });
    
    const article = await Article.create(articleData);
    console.log('✅ Article generated and saved:', article._id);

   
    const transformedArticle = {
      id: article._id.toString(),
      ...article.toObject(),
      summary: article.summary || (article.content ? article.content.substring(0, 200) + '...' : 'No summary available')
    };

    res.status(201).json({
      success: true,
      message: "Article generated successfully from news",
      article: transformedArticle,
      metadata: {
        aiProvider: "gemini",
        generatedAt: new Date(),
        language,
        tone,
        wordCount: structuredContent.content.split(' ').length,
        sourceImage: sourceImage,
        sourceUrl: sourceUrl,
        tags: structuredContent.tags
      }
    });

  } catch (error) {
    console.error("❌ Article generation error:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    let errorMessage = "Error generating article from news";
    if (error.name === 'ValidationError') {
      errorMessage = "Invalid article data. Please check your input.";
    } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      errorMessage = "Database error. Please try again.";
    } else if (error.message.includes('GEMINI_API_KEY')) {
      errorMessage = "AI service not configured. Please check your environment variables.";
    } else if (error.message.includes('Failed to generate article content')) {
      errorMessage = "AI service error. Please try again.";
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




export const regenerateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { newTitle, newSummary, newCategory, newRegion, newTone = "neutral", newLanguage = "en" } = req.body;

    const existingArticle = await Article.findById(id);
    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }

    const title = newTitle || existingArticle.title;
    const summary = newSummary || existingArticle.summary;
    const category = newCategory || existingArticle.category;
    const region = newRegion || existingArticle.region;

 
    const validCategories = [
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
    ];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    const validRegions = [
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
    ];
    
    if (!validRegions.includes(region)) {
      return res.status(400).json({
        success: false,
        message: `Invalid region. Must be one of: ${validRegions.join(', ')}`
      });
    }

    
    const generationPrompt = createNewsBasedPrompt({
      title,
      summary,
      category,
      tone: newTone,
      language: newLanguage,
      sourceName: existingArticle.sourceName,
      publishedAt: existingArticle.publishedAt
    });
    
    console.log("Regenerating article with Gemini...");
    
    const generatedContent = await generateWithGemini(generationPrompt);

    if (!generatedContent) {
      return res.status(500).json({
        success: false,
        message: "Failed to regenerate article content"
      });
    }

 
    const structuredContent = parseGeminiResponse(generatedContent, title);

    
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      {
        title: structuredContent.title,
        content: structuredContent.content,
        summary: structuredContent.summary,
        tags: structuredContent.tags,
        category,
        region,
        updatedAt: new Date(),
        metadata: {
          ...existingArticle.metadata,
          lastRegeneratedAt: new Date(),
          regenerationCount: (existingArticle.metadata?.regenerationCount || 0) + 1
        }
      },
      { new: true }
    );

    console.log('✅ Article regenerated successfully');

   
    const transformedArticle = {
      id: updatedArticle._id.toString(),
      ...updatedArticle.toObject()
    };

    res.json({
      success: true,
      message: "Article regenerated successfully",
      article: transformedArticle,
      metadata: {
        regeneratedAt: new Date(),
        aiProvider: "gemini",
        wordCount: structuredContent.content.split(' ').length,
        tags: structuredContent.tags
      }
    });

  } catch (error) {
    console.error("❌ Article regeneration error:", error);
    res.status(500).json({
      success: false,
      message: "Error regenerating article",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const createNewsBasedPrompt = ({ title, summary, category, tone, language, sourceName, publishedAt }) => {
  const prompt = `
Generate a comprehensive, well-structured article based on this news headline and information:

HEADLINE: "${title}"
SUMMARY: "${summary || 'No additional summary provided'}"
CATEGORY: ${category}
TONE: ${tone}
LANGUAGE: ${language}
SOURCE: ${sourceName || 'News Source'}
PUBLISHED: ${publishedAt ? new Date(publishedAt).toLocaleDateString() : 'Recent'}

Please generate a complete article with the following structure:

1. Start with an engaging introduction that draws the reader in

2. Follow with a detailed main body (800-1200 words) that:
   - Provides context and background
   - Analyzes key points
   - Includes relevant examples or data
   - Uses clear paragraph breaks for readability

3. End with a strong conclusion summarizing key points

IMPORTANT GUIDELINES:
- Write in ${tone} tone
- Use clear, engaging language
- Ensure factual accuracy
- Include relevant context
- Break into readable paragraphs
- Add depth beyond the headline

FORMAT REQUIREMENTS:
- Provide the article in plain text format only
- Use clear paragraph breaks (double line breaks between paragraphs)
- Do NOT include markdown formatting (no **bold** or *italic*)
- Do NOT include metadata like "Published:", "Source:", or "Category:"
- Start directly with the article content
`;

  return prompt;
};

const parseGeminiResponse = (response, originalTitle) => {
  try {
    let cleanedContent = response
      .trim()
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^(Published|Source|Category):.*$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+$/gm, '')
      .replace(/^\s*\n/gm, '') 
      .trim();

    return {
      title: originalTitle,
      content: cleanedContent,
      tags: extractTags(cleanedContent),
      resources: [],
      summary: extractSummary(cleanedContent)
    };
  } catch (error) {
    console.error("Error processing article content:", error);
    return {
      title: originalTitle,
      content: response,
      tags: extractTags(response),
      resources: [],
      summary: extractSummary(response)
    };
  }
};

const extractSummary = (content) => {
  const sentences = content.split('.').filter(s => s.trim().length > 20);
  return sentences.slice(0, 2).join('.') + '.';
};

const extractTags = (text) => {
  const words = text.toLowerCase().split(/\W+/);
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'will', 'would', 'could', 'should'];
  const tags = words
    .filter(word => word.length > 4 && !commonWords.includes(word))
    .slice(0, 8);
  
  return [...new Set(tags)];
};