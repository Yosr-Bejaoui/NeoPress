import React from 'react';

const QuickActionCard = ({ icon: Icon, title, description, buttonText, onClick, color }) => {
  const colorMap = {
    blue: { text: 'text-blue-600', hover: 'hover:text-blue-700' },
    green: { text: 'text-green-600', hover: 'hover:text-green-700' },
    purple: { text: 'text-purple-600', hover: 'hover:text-purple-700' },
    orange: { text: 'text-orange-600', hover: 'hover:text-orange-700' }
  };
  const classes = colorMap[color] || colorMap.blue;
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={classes.text} size={20} />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <button 
        onClick={onClick}
        className={`${classes.text} font-medium ${classes.hover}`}
      >
        {buttonText} →
      </button>
    </div>
  );
};

export default QuickActionCard;