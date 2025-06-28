import React from 'react';

const Loader = ({ size = 'medium', center = false }) => {
  const sizeClass = size === 'small' ? 'h-4 w-4' : 
                  size === 'large' ? 'h-8 w-8' : 'h-6 w-6';
  
  const containerClass = center ? 'flex items-center justify-center' : '';
  
  return (
    <div className={containerClass}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary ${sizeClass}`}></div>
    </div>
  );
};

export default Loader; 