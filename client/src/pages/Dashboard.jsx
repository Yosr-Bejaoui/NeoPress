import React, { useState } from 'react';
import Header from '../components/Header';
import DashboardView from '../components/DashboardView';
import ArticlesView from '../components/ArticlesView';
import AnalyticsView from '../components/AnalyticsView';
import ArticleGeneration from '../components/ArticleGeneration';
import Footer from '../components/Footer';

const NeoPressDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleGenerateArticle = () => {
    setCurrentView('generate');
  };

  const handleArticleGenerated = (newArticle) => {
    setCurrentView('articles');
   
    setRefreshTrigger(prev => prev + 1);
  };

  const handleBackFromGenerate = () => {
    setCurrentView('articles');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView setCurrentView={setCurrentView} />;
      case 'articles':
        return (
          <ArticlesView 
            onGenerateArticle={handleGenerateArticle}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'analytics':
        return <AnalyticsView />;
      case 'generate':
        return (
          <ArticleGeneration 
            onBack={handleBackFromGenerate}
            onArticleGenerated={handleArticleGenerated}
          />
        );
      default:
        return <DashboardView setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {renderCurrentView()}
      </main>
      
      <Footer />
    </div>
  );
};

export default NeoPressDashboard;
