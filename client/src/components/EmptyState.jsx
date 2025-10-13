import React from 'react';

const EmptyState = ({ icon: Icon, title, description }) => {
  return (
    <div className="text-center py-12 text-gray-500">
      {Icon && <Icon size={48} className="mx-auto mb-4 text-gray-300" />}
      {title && <p className="text-lg">{title}</p>}
      {description && <p className="text-sm">{description}</p>}
    </div>
  );
};

export default EmptyState;