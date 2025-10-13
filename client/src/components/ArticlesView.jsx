import React, { Component } from 'react';
import { Plus, FileText, RefreshCw, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { articleService } from '../services/api';
import TabNavigation from './TabNavigation';
import SearchFilterBar from './SearchFilterBar';
import EmptyState from './EmptyState';
import ArticleCard from './ArticleCard';
import EditModal from './EditModal';
import AnalyticsModal from './AnalyticsModal';

class ArticlesView extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      selectedTab: 'All Articles',
      articles: [],
      loading: true,
      error: null,
      searchTerm: '',
      filterCategory: 'all',
      notification: null,
      editModal: { isOpen: false, article: null },
      analyticsModal: { isOpen: false, article: null },
      selectedArticles: [],
      isBulkProcessing: false
    };

   
    this.handleEditSubmit = this.handleEditSubmit.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleApprove = this.handleApprove.bind(this);
    this.handleReject = this.handleReject.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleAnalytics = this.handleAnalytics.bind(this);
    this.closeEditModal = this.closeEditModal.bind(this);
    this.closeAnalyticsModal = this.closeAnalyticsModal.bind(this);
    this.handleViewFull = this.handleViewFull.bind(this);
    this.fetchArticles = this.fetchArticles.bind(this);
    this.showNotification = this.showNotification.bind(this);
    this.handleSelectArticle = this.handleSelectArticle.bind(this);
    this.handleSelectAll = this.handleSelectAll.bind(this);
    this.handleBulkApprove = this.handleBulkApprove.bind(this);
    this.handleBulkDelete = this.handleBulkDelete.bind(this);
  }

  componentDidMount() {
    this.fetchArticles();
  }

  showNotification(message, type = 'success') {
    this.setState({ notification: { message, type } });
    setTimeout(() => this.setState({ notification: null }), 3000);
  }

  async fetchArticles() {
    try {
      this.setState({ loading: true, error: null });
      
      console.log('Fetching articles from API...');
      
      const response = await articleService.getArticles({ status: 'all' });
      console.log('API Response:', response);
      
      let articlesData = [];
      if ((response.success || response.ok) && response.articles) {
        articlesData = response.articles;
      } else if (Array.isArray(response)) {
        articlesData = response;
      } else if (response.articles) {
        articlesData = response.articles;
      } else if (Array.isArray(response.data)) {
        articlesData = response.data;
      }
      
      this.setState({ articles: articlesData, loading: false });
      console.log(`Successfully fetched ${articlesData.length} articles`);
      
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      
      let errorMessage = 'Failed to fetch articles';
      if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        errorMessage = 'Network error - please check if the backend server is running';
      } else if (err.response?.status === 404) {
        errorMessage = 'Articles endpoint not found - please check the API URL';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error - please try again later';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      this.setState({ error: errorMessage, articles: [], loading: false });
    }
  }

 
  
  validCategories = [
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

  async handleEditSubmit(updatedArticle) {
    console.log('ArticlesView (Class): Processing article update:', updatedArticle);
    
    try {
      if (!updatedArticle.id) {
        throw new Error('Article ID is missing');
      }

    
      if (updatedArticle.category && !this.validCategories.includes(updatedArticle.category)) {
        throw new Error(`Invalid category. Must be one of: ${this.validCategories.join(', ')}`);
      }
      
      const updateData = {
        title: updatedArticle.title,
        content: updatedArticle.content,
        summary: updatedArticle.summary,
        category: updatedArticle.category,
        region: updatedArticle.region,
        status: updatedArticle.status,
        tags: Array.isArray(updatedArticle.tags) ? updatedArticle.tags : [],
        updatedAt: new Date().toISOString()
      };
      
   
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === null) {
          delete updateData[key];
        }
      });
      
      console.log('ArticlesView (Class): Sending update data:', updateData);
      
      const response = await articleService.updateArticle(updatedArticle.id, updateData);
      
      if (response.success || response.ok) {
        this.showNotification('Article updated successfully');
        this.setState({ editModal: { isOpen: false, article: null } });
        await this.fetchArticles();
      } else {
        throw new Error(response.message || 'Update failed');
      }
      
      return response;
    } catch (err) {
      console.error('ArticlesView (Class): Failed to update article:', err);
      
      let errorMessage = 'Failed to update article';
      if (err.response?.data?.error) {
        errorMessage += ': ' + err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage += ': ' + err.response.data.message;
      } else if (err.message) {
        errorMessage += ': ' + err.message;
      }
      
      this.showNotification(errorMessage, 'error');
      throw err;
    }
  }

  handleEdit(article) {
    console.log('ArticlesView (Class): Opening edit modal for article:', article);
    
    if (this.props.onEditArticle) {
      this.props.onEditArticle(article);
      return;
    }


    const category = article.category || 'Technology';
    if (!this.validCategories.includes(category)) {
      this.showNotification(`Invalid category '${category}'. Using default category 'Technology'`, 'warning');
      article.category = 'Technology';
    }

    const completeArticle = {
      id: article.id,
      title: article.title || 'Untitled Article',
      content: article.content || article.body || article.text || '',
      summary: article.summary || '',
      category: article.category || 'Uncategorized',
      status: article.status || 'draft',
      tags: Array.isArray(article.tags) ? article.tags : 
            (typeof article.tags === 'string' ? article.tags.split(',').map(t => t.trim()) : []),
      author: article.author || 'AI Assistant',
      date: article.date || article.createdAt || new Date().toLocaleDateString(),
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      confidence: article.confidence,
      views: article.views,
      wordCount: article.wordCount,
      region: article.region,
      sourceUrl: article.sourceUrl,
      sourceName: article.sourceName,
      url: article.url,
      ...article
    };
    
    console.log('ArticlesView (Class): About to set edit modal state');
    this.setState({ editModal: { isOpen: true, article: completeArticle } });
  }

  async handleApprove(articleId) {
    console.log('ArticlesView (Class): Approving article ID:', articleId);
    const updateData = { status: 'approved' };
    
    try {
  
      let response;
      if (articleService.approveArticle) {
        response = await articleService.approveArticle(articleId);
      } else {
        response = await articleService.updateArticle(articleId, updateData);
      }
      console.log('Update response:', response);
      
      if (response.success || response.ok) {
        this.showNotification('Article approved successfully');
        await this.fetchArticles();
      } else {
        throw new Error(response.message || 'Approval failed');
      }
      
      return response;
    } catch (err) {
      console.error('Failed to approve article:', err);
      let errorMessage = 'Failed to approve article';
      if (err.response?.data?.error) {
        errorMessage += ': ' + err.response.data.error;
      } else if (err.message) {
        errorMessage += ': ' + err.message;
      }
      this.showNotification(errorMessage, 'error');
      throw err;
    }
  }

  async handleReject(articleId) {
    try {
      let response;
      if (articleService.rejectArticle) {
        response = await articleService.rejectArticle(articleId);
      } else {
        response = await articleService.updateArticle(articleId, { status: 'rejected' });
      }
      
      if (response.success || response.ok) {
        this.showNotification('Article rejected');
        await this.fetchArticles();
      } else {
        throw new Error(response.message || 'Rejection failed');
      }
    } catch (err) {
      console.error('Failed to reject article:', err);
      let errorMessage = 'Failed to reject article';
      if (err.message) {
        errorMessage += ': ' + err.message;
      }
      this.showNotification(errorMessage, 'error');
      throw err;
    }
  }

  async handleDelete(articleId) {
    try {
      const response = await articleService.deleteArticle(articleId);
      
      if (response.success || response.ok) {
        this.showNotification('Article deleted successfully');
        await this.fetchArticles();
      } else {
        throw new Error(response.message || 'Deletion failed');
      }
    } catch (err) {
      console.error('Failed to delete article:', err);
      let errorMessage = 'Failed to delete article';
      if (err.message) {
        errorMessage += ': ' + err.message;
      }
      this.showNotification(errorMessage, 'error');
      throw err;
    }
  }

  handleAnalytics(article) {
    console.log('ArticlesView (Class): Opening analytics modal for article:', article);
    
    if (this.props.onAnalyticsArticle) {
      this.props.onAnalyticsArticle(article);
    } else {
      this.setState({ analyticsModal: { isOpen: true, article } });
    }
  }

  closeEditModal() {
    this.setState({ editModal: { isOpen: false, article: null } });
  }

  closeAnalyticsModal() {
    this.setState({ analyticsModal: { isOpen: false, article: null } });
  }

  handleSelectArticle(articleId) {
    this.setState(prevState => {
      const selectedArticles = prevState.selectedArticles.includes(articleId)
        ? prevState.selectedArticles.filter(id => id !== articleId)
        : [...prevState.selectedArticles, articleId];
      return { selectedArticles };
    });
  }

  handleSelectAll() {
    const filtered = this.getFilteredArticles();
    this.setState(prevState => {
      if (prevState.selectedArticles.length === filtered.length) {
        return { selectedArticles: [] };
      } else {
        return { selectedArticles: filtered.map(a => a.id || a._id?.$oid || a._id) };
      }
    });
  }

  async handleBulkApprove() {
    const { selectedArticles } = this.state;
    if (selectedArticles.length === 0) return;

    this.setState({ isBulkProcessing: true });
    let successCount = 0;
    let failCount = 0;

    for (const articleId of selectedArticles) {
      try {
        await this.handleApprove(articleId);
        successCount++;
      } catch (error) {
        failCount++;
        console.error(`Failed to approve article ${articleId}:`, error);
      }
    }

    this.setState({ isBulkProcessing: false, selectedArticles: [] });
    
    if (failCount === 0) {
      this.showNotification(`Successfully approved ${successCount} article(s)`);
    } else {
      this.showNotification(`Approved ${successCount}, failed ${failCount} article(s)`, 'warning');
    }
  }

  async handleBulkDelete() {
    const { selectedArticles } = this.state;
    if (selectedArticles.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedArticles.length} article(s)?`)) {
      return;
    }

    this.setState({ isBulkProcessing: true });
    let successCount = 0;
    let failCount = 0;

    for (const articleId of selectedArticles) {
      try {
        await this.handleDelete(articleId);
        successCount++;
      } catch (error) {
        failCount++;
        console.error(`Failed to delete article ${articleId}:`, error);
      }
    }

    this.setState({ isBulkProcessing: false, selectedArticles: [] });
    
    if (failCount === 0) {
      this.showNotification(`Successfully deleted ${successCount} article(s)`);
    } else {
      this.showNotification(`Deleted ${successCount}, failed ${failCount} article(s)`, 'warning');
    }
  }

  handleViewFull(article) {
    const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${article.title}</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              .header { border-bottom: 2px solid #ccc; padding-bottom: 20px; margin-bottom: 20px; }
              .meta { color: #666; font-size: 14px; margin: 10px 0; }
              .content { line-height: 1.6; white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${article.title}</h1>
              <div class="meta">
                <span>Status: ${article.status}</span> | 
                <span>Category: ${article.category || 'General'}</span> | 
                <span>Date: ${article.date}</span>
              </div>
            </div>
            <div class="content">
              ${article.content || article.summary || 'No content available'}
            </div>
            ${article.sourceUrl ? `<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;">
              <strong>Source:</strong> <a href="${article.sourceUrl}" target="_blank">${article.sourceName || 'Original Article'}</a>
            </div>` : ''}
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  }

  getFilteredArticles() {
    let filtered = this.state.articles;
    const { selectedTab, searchTerm, filterCategory } = this.state;

    if (selectedTab !== 'All Articles') {
      filtered = filtered.filter(article => {
        const status = article.status?.toLowerCase();
        const tabName = selectedTab.toLowerCase();
        
        if (tabName === 'pending') {
          return status === 'pending' || status === 'draft';
        }
        if (tabName === 'approved') {
          return status === 'approved' || status === 'published';
        }
        if (tabName === 'rejected') {
          return status === 'rejected';
        }
        if (tabName === 'draft') {
          return status === 'draft';
        }
        
        return status === tabName;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory && filterCategory !== 'all') {
      filtered = filtered.filter(article =>
        article.category?.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    return filtered;
  }

  getTabCounts() {
    const { articles } = this.state;
    const counts = {
      'All Articles': articles.length,
      'Pending': articles.filter(a => a.status?.toLowerCase() === 'pending' || a.status?.toLowerCase() === 'draft').length,
      'Approved': articles.filter(a => a.status?.toLowerCase() === 'approved' || a.status?.toLowerCase() === 'published').length,
      'Rejected': articles.filter(a => a.status?.toLowerCase() === 'rejected').length,
      'Draft': articles.filter(a => a.status?.toLowerCase() === 'draft').length,
    };
    return counts;
  }

  render() {
    const { 
      selectedTab, 
      loading, 
      error, 
      searchTerm, 
      filterCategory, 
      notification, 
      editModal, 
      analyticsModal 
    } = this.state;

    const tabCounts = this.getTabCounts();
    const filteredArticles = this.getFilteredArticles();

    const tabs = [
      { name: 'All Articles', count: tabCounts['All Articles'] },
      { name: 'Pending', count: tabCounts['Pending'] },
      { name: 'Approved', count: tabCounts['Approved'] },
      { name: 'Rejected', count: tabCounts['Rejected'] },
      { name: 'Draft', count: tabCounts['Draft'] }
    ];

    return (
      <div className="space-y-6">
      
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {notification.message}
          </div>
        )}

       
        {editModal.isOpen && editModal.article && (
          <EditModal 
            isOpen={true}
            onClose={this.closeEditModal}
            article={editModal.article}
            onSubmit={this.handleEditSubmit}
            key={`edit-modal-${editModal.article.id}`}
          />
        )}

      
        <AnalyticsModal 
          isOpen={analyticsModal.isOpen}
          onClose={this.closeAnalyticsModal}
          article={analyticsModal.article}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Article Management</h1>
            <p className="text-gray-600 mt-2">Review, edit, and manage AI-generated articles</p>
          </div>
          <div className="flex items-center gap-3">
            {this.state.selectedArticles.length > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  {this.state.selectedArticles.length} selected
                </span>
                <button 
                  onClick={this.handleBulkApprove}
                  disabled={this.state.isBulkProcessing}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  Approve Selected
                </button>
                <button 
                  onClick={this.handleBulkDelete}
                  disabled={this.state.isBulkProcessing}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Delete Selected
                </button>
              </>
            )}
            <button 
              onClick={() => this.fetchArticles()}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`${loading ? 'animate-spin' : ''}`} size={16} />
              Refresh
            </button>
            <button 
              onClick={() => {
                  this.props.onGenerateArticle();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              <Plus size={16} />
              Generate Article
            </button>
          </div>
        </div>

        <TabNavigation 
          tabs={tabs}
          selectedTab={selectedTab}
          setSelectedTab={(tab) => this.setState({ selectedTab: tab })}
        />


     
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-500" size={16} />
              <h3 className="text-sm font-medium text-red-800">Error Loading Articles</h3>
            </div>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
              <button 
                onClick={() => this.fetchArticles()}
                className="mt-2 text-red-600 hover:text-red-800 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

   
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-gray-600">
              <RefreshCw className="animate-spin" size={20} />
              <span>Loading articles...</span>
            </div>
          </div>
        )}

       
        {!loading && !error && (
          <>
            {filteredArticles.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                  <input
                    type="checkbox"
                    checked={this.state.selectedArticles.length === filteredArticles.length && filteredArticles.length > 0}
                    onChange={this.handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({filteredArticles.length} articles)
                  </span>
                </div>
                {filteredArticles.map((article, index) => {
                  const articleId = article.id || article._id?.$oid || article._id;
                  return (
                    <ArticleCard
                      key={articleId || index}
                      article={{
                        ...article,
                        status: article.status || 'Draft',
                        category: article.category || 'Uncategorized',
                        region: article.region || 'Global',
                        date: article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'Unknown',
                        confidence: article.confidence || '95%',
                        summary: article.summary || article.content?.substring(0, 200) + '...' || 'No summary available'
                      }}
                      isSelected={this.state.selectedArticles.includes(articleId)}
                      onSelect={() => this.handleSelectArticle(articleId)}
                      onEdit={this.handleEdit}
                      onAnalytics={this.handleAnalytics}
                      onApprove={this.handleApprove}
                      onReject={this.handleReject}
                      onDelete={this.handleDelete}
                      onViewFull={this.handleViewFull}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState 
                icon={FileText}
                title={searchTerm || filterCategory !== 'all' ? "No articles match your filters" : "No articles found"}
                description={searchTerm || filterCategory !== 'all' 
                  ? "Try adjusting your search terms or filters"
                  : "Articles will appear here when generated. Click 'Generate Article' to create your first one."
                }
              />
            )}
          </>
        )}

      
        {!loading && !error && filteredArticles.length > 0 && (
          <div className="text-sm text-gray-500 text-center py-4 border-t">
            Showing {filteredArticles.length} of {this.state.articles.length} articles
            {searchTerm && ` matching "${searchTerm}"`}
            {filterCategory !== 'all' && ` in ${filterCategory} category`}
          </div>
        )}
      </div>
    );
  }
}

export default ArticlesView;