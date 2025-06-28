import React from 'react';

const EmptyState = ({ 
  title = 'No data found', 
  description = 'There is no data available to display.', 
  icon, 
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {icon && (
        <div className="mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 text-center max-w-md">{description}</p>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState; 