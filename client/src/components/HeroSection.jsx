import React, { useState } from 'react';
import { Search } from 'lucide-react';

const HeroSection = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value); 
  };

  return (
    <section 
      className="relative py-12 h-[600px] flex items-center"
      style={{
        backgroundImage: 'url("/ll.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      
      
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h1 
          className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg"
          style={{
            fontFamily: "'Times New Roman', Times, serif"
          }}
        >
          Where AI Meets Journalism Excellence
        </h1>
        <p 
          className="text-xl text-white mb-12 drop-shadow-md"
          style={{
            fontFamily: "'Times New Roman', Times, serif"
          }}
        >
          Discover news that matters, curated with artificial intelligence and crafted with journalistic integrity.
        </p>
        
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl backdrop-blur-sm bg-opacity-95">
            <div className="flex items-center p-2">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search news articles..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-4 text-lg bg-transparent border-0 focus:ring-0 text-gray-900 placeholder-gray-500"
                />
              </div>
              
           
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;