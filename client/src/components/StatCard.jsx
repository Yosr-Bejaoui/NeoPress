import React from 'react';

const StatCard = ({ title, value, change, changeType, color, icon: Icon }) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          <p className={`text-sm mt-1 ${changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-600' : 'text-gray-400'}`}>
            {change}
          </p>
        </div>
        <div className={`p-3 rounded-full bg-gray-50 ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;