import React from 'react';
import { BarChart3, FileText, TrendingUp, Globe, User, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header = ({ currentView, setCurrentView, onNavigateToMain }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="bg-white/80 dark:bg-gray-900/70 backdrop-blur border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <h1 
                className={`text-2xl font-bold font-serif tracking-wide ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}
                style={{
                  fontFamily: "'Times New Roman', Times, serif"
                }}
              >
                NeoPress Admin
              </h1>
            </div>
            <nav className="flex items-center gap-6" role="navigation" aria-label="Admin navigation">
              <button
                onClick={() => setCurrentView('dashboard')}
                aria-current={currentView === 'dashboard' ? 'page' : undefined}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                  currentView === 'dashboard'
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 size={16} />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('articles')}
                aria-current={currentView === 'articles' ? 'page' : undefined}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                  currentView === 'articles'
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FileText size={16} />
                Articles
              </button>
              <button
                onClick={() => setCurrentView('analytics')}
                aria-current={currentView === 'analytics' ? 'page' : undefined}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                  currentView === 'analytics'
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <TrendingUp size={16} />
                Analytics
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <Globe size={16} />
              View Site
            </a>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" onClick={() => {
              try { localStorage.removeItem('authToken'); } catch {}
              window.location.reload();
            }}>
              <User size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;