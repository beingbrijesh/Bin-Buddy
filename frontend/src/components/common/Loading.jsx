import React from 'react';

const variants = {
  small: 'h-4 w-4',
  medium: 'h-8 w-8',
  large: 'h-12 w-12'
};

const Loading = ({ variant = 'medium', className = '', fullScreen = false }) => {
  const sizeClass = variants[variant];
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className={`spinner ${sizeClass} ${className}`} />
      </div>
    );
  }

  return <div className={`spinner ${sizeClass} ${className}`} />;
};

export default React.memo(Loading); 