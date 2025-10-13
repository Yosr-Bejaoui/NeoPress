import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <h1 
              className={`text-3xl font-bold font-serif tracking-wide ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}
              style={{
                fontFamily: "'Times New Roman', Times, serif"
              }}
            >
              NeoPress
            </h1>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;