import React from 'react';

const TabNavigation = ({ tabs, selectedTab, setSelectedTab }) => {
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => setSelectedTab(tab.name)}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            selectedTab === tab.name
              ? 'bg-black text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.name}
          <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;