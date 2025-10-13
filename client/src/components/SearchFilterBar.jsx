import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const SearchFilterBar = ({ 
  filterCategory = 'all', 
  setFilterCategory,
  availableCategories = [],
  filterRegion = 'all',
  setFilterRegion
}) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const categoryRef = useRef(null);
  const regionRef = useRef(null);


  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'tech', label: 'Technology' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'business', label: 'Business & Finance' },
    { value: 'politics', label: 'Politics' },
    { value: 'sports', label: 'Sports' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'science', label: 'Science' },
    { value: 'education', label: 'Education' },
    { value: 'environment', label: 'Environment' },
    { value: 'culture', label: 'Culture & Arts' },
    { value: 'travel', label: 'Travel' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'fashion', label: 'Fashion & Style' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'opinion', label: 'Opinion & Analysis' },
    ...(availableCategories && availableCategories.length > 0 
      ? availableCategories.map(cat => ({
          value: cat.toLowerCase(),
          label: cat
        }))
      : []
    )
  ];

  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: 'Local', label: 'Local' },
    { value: 'National', label: 'National' },
    { value: 'MENA', label: 'MENA' },
    { value: 'Europe', label: 'Europe' },
    { value: 'Asia', label: 'Asia' },
    { value: 'Africa', label: 'Africa' },
    { value: 'North America', label: 'North America' },
    { value: 'South America', label: 'South America' },
    { value: 'Australia & Oceania', label: 'Australia & Oceania' },
    { value: 'International', label: 'International' }
  ];




  const handleCategoryChange = (category) => {
    if (setFilterCategory) {
      setFilterCategory(category);
    }
    setIsCategoryOpen(false);
  };

  const handleRegionChange = (region) => {
    if (setFilterRegion) {
      setFilterRegion(region);
    }
    setIsRegionOpen(false);
  };



  const getCategoryLabel = () => {
    const category = categories.find(cat => cat.value === filterCategory);
    return category ? category.label : 'All Categories';
  };

  const getRegionLabel = () => {
    const region = regions.find(reg => reg.value === filterRegion);
    return region ? region.label : 'All Regions';
  };

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
      if (regionRef.current && !regionRef.current.contains(event.target)) {
        setIsRegionOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-8 sticky top-16 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
     
        <div className="relative flex-shrink-0" ref={categoryRef}>
          <button 
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors min-w-[160px] justify-between"
          >
            <span className="text-sm font-medium text-gray-700 truncate">
              {getCategoryLabel()}
            </span>
            <ChevronDown size={16} className={`transition-transform flex-shrink-0 ${isCategoryOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isCategoryOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    filterCategory === category.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </div>

      
        <div className="relative flex-shrink-0" ref={regionRef}>
          <button 
            onClick={() => setIsRegionOpen(!isRegionOpen)}
            className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors min-w-[140px] justify-between"
          >
            <span className="text-sm font-medium text-gray-700 truncate">
              {getRegionLabel()}
            </span>
            <ChevronDown size={16} className={`transition-transform flex-shrink-0 ${isRegionOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isRegionOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              {regions.map((region) => (
                <button
                  key={region.value}
                  onClick={() => handleRegionChange(region.value)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    filterRegion === region.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  {region.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;