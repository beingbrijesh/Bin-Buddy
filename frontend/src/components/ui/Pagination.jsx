import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  current = 1,
  pageSize = 10,
  total = 0,
  onChange,
  showSizeChanger = false,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange
}) => {
  const totalPages = Math.ceil(total / pageSize);
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPages = 5; // Maximum number of page buttons to show
    
    if (totalPages <= maxPages) {
      // If total pages is less than or equal to maxPages, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Add pages around current page
      let start = Math.max(2, current - 1);
      let end = Math.min(totalPages - 1, current + 1);
      
      // Adjust to show more pages if we're at edges
      if (current <= 2) {
        end = Math.min(totalPages - 1, 4);
      } else if (current >= totalPages - 1) {
        start = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always include last page if there are more than one page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  const handlePageChange = (page) => {
    if (page !== current && page >= 1 && page <= totalPages) {
      onChange(page);
    }
  };
  
  const handlePageSizeChange = (e) => {
    if (onPageSizeChange) {
      onPageSizeChange(Number(e.target.value));
    }
  };
  
  if (total <= 0) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="text-sm text-gray-500">
        Showing {Math.min((current - 1) * pageSize + 1, total)} to {Math.min(current * pageSize, total)} of {total} results
      </div>
      
      <div className="flex items-center">
        {/* Page Size Changer */}
        {showSizeChanger && (
          <div className="flex items-center mr-4">
            <span className="text-sm text-gray-500 mr-2">Show</span>
            <select 
              className="select select-bordered select-sm"
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Pagination Buttons */}
        <div className="flex">
          <button
            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(current - 1)}
            disabled={current === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="hidden md:flex">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="inline-flex items-center justify-center w-8 h-8 text-gray-500">
                    ...
                  </span>
                ) : (
                  <button
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium ${
                      page === current
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'border border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="md:hidden">
            <span className="inline-flex items-center justify-center min-w-8 h-8 px-2 border border-gray-300 bg-white text-sm font-medium">
              {current} / {totalPages}
            </span>
          </div>
          
          <button
            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(current + 1)}
            disabled={current === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination; 