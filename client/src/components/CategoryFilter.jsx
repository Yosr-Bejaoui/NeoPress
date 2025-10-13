import React from 'react';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-2 mb-8">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded-full w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;