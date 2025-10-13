import React, { useState, useEffect, useCallback } from 'react';
import { X, Save } from 'lucide-react';

const EditModal = ({ isOpen, onClose, article, onSubmit }) => {
  const categories = [
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
  
 
  const regions = [
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

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '',
    region: 'International',
    status: 'draft',
    tags: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    console.log('EditModal: Props received:', {
      isOpen,
      hasOnClose: typeof onClose === 'function',
      hasOnSubmit: typeof onSubmit === 'function',
      hasArticle: !!article,
      articleId: article?.id
    });
    
    if (isOpen && !onSubmit) {
      console.error('EditModal: onSubmit prop is missing!');
    }
  }, [isOpen, onClose, onSubmit, article]);

 
  useEffect(() => {
    if (isOpen && article) {
      console.log('EditModal: Setting form data from article:', article);
      
    
      const content = article.content || article.body || article.text || article.summary || '';
      
    
      const validRegion = regions.includes(article.region) ? article.region : 'International';
      if (article.region && !regions.includes(article.region)) {
        console.warn(`EditModal: Invalid region "${article.region}", using "International"`);
      }
      
      setFormData({
        title: article.title || '',
        content: content,
        summary: article.summary || '',
        category: article.category || '',
        region: validRegion,
        status: article.status || 'draft',
        tags: Array.isArray(article.tags) ? article.tags : 
              (typeof article.tags === 'string' ? article.tags.split(',').map(t => t.trim()) : [])
      });
      setError(null);
      setLoading(false);
    } else if (!isOpen) {
   
      setFormData({
        title: '',
        content: '',
        summary: '',
        category: '',
        region: 'International',
        status: 'draft',
        tags: []
      });
      setError(null);
      setLoading(false);
    }
  }, [isOpen, article]);

  
  const handleChange = useCallback((field, value) => {
    console.log(`EditModal: Updating ${field} with:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
  
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

 
    if (!onSubmit) {
      const errorMessage = 'Save function is not available - please close and try again';
      setError(errorMessage);
      console.error('EditModal: onSubmit prop is missing during submit');
      return;
    }

    if (typeof onSubmit !== 'function') {
      const errorMessage = 'Save function is invalid - please refresh the page and try again';
      setError(errorMessage);
      console.error('EditModal: onSubmit is not a function:', typeof onSubmit);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('EditModal: Submitting form data:', formData);
      
      
      const validRegion = regions.includes(formData.region) ? formData.region : 'International';
      if (formData.region !== validRegion) {
        console.warn(`EditModal: Invalid region "${formData.region}", using "International"`);
      }
      
      
      const validCategory = categories.includes(formData.category) ? formData.category : categories[0];
      if (formData.category !== validCategory) {
        console.warn(`EditModal: Invalid category "${formData.category}", using "${validCategory}"`);
      }
     
      const updatedArticle = {
        id: article.id, 
        title: formData.title.trim(),
        content: formData.content,
        summary: formData.summary,
        category: validCategory,
        region: validRegion,
        status: formData.status,
        tags: formData.tags,
        author: article.author,
        date: article.date,
        createdAt: article.createdAt,
        updatedAt: new Date().toISOString(),
        confidence: article.confidence,
        views: article.views,
        wordCount: formData.content ? formData.content.split(/\s+/).filter(word => word).length : 0,
        sourceUrl: article.sourceUrl,
        sourceName: article.sourceName,
      };
      
      console.log('EditModal: Final article data being submitted:', updatedArticle);
      console.log('EditModal: About to call onSubmit function:', typeof onSubmit);
      
      const result = await onSubmit(updatedArticle);
      console.log('EditModal: Submit result:', result);
      
      
    } catch (err) {
      console.error('EditModal: Submit error:', err);
      setError(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTagsChange = useCallback((e) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    handleChange('tags', tagsArray);
  }, [handleChange]);

  const handleClose = useCallback(() => {
    if (!loading && onClose) {
      onClose();
    }
  }, [loading, onClose]);

  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
   
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Edit Article</h2>
            <p className="text-gray-600 text-sm mt-1">
              Make changes to: {article.title || 'Untitled Article'}
            </p>
          </div>
          <button 
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        
 
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

     
          {!onSubmit && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-600 text-sm">
                Warning: Save function is not available. Please close this modal and try again.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
        
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter article title..."
                required
                disabled={loading}
              />
            </div>

       
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter article summary..."
                disabled={loading}
              />
            </div>
            
       
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                style={{ whiteSpace: 'pre-wrap' }}
                placeholder="Enter article content..."
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Word count: {formData.content ? formData.content.split(/\s+/).filter(word => word).length : 0}
              </p>
            </div>

        
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => handleChange('region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="published">Published</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

        
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={handleTagsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter tags separated by commas..."
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple tags with commas
              </p>
            </div>
          </form>
        </div>
        
    
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>ID: {article.id}</span>
            {article.confidence && <span>AI Confidence: {article.confidence}</span>}
            {article.date && <span>Created: {article.date}</span>}
            <span className="text-xs">
              onSubmit: {onSubmit ? '✓ Available' : '✗ Missing'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !formData.title.trim() || !onSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!onSubmit ? 'Save function is not available' : ''}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;