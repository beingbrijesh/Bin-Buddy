import React from 'react';
import { Search, XCircle, RefreshCw, Filter } from 'lucide-react';

import { useState } from 'react';

const FilterSearchBar = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  onRefresh,
  filters,
  onFilterChange,
  filterOptions,
  onClearFilters,
}) => {
  const safeFilterOptions = filterOptions || { status: [], type: [], zone: [], sortBy: [] };

  // Local loading state for refresh action
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshClick = async () => {
    try {
      const maybePromise = onRefresh?.();
      // If onRefresh returns a promise, wait for it so we can show a spinner
      if (maybePromise && typeof maybePromise.then === 'function') {
        setRefreshing(true);
        await maybePromise;
      }
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 bg-white rounded-lg shadow">
      
      {/* Search Section */}
      <div className="flex justify-start">
        <div className="flex items-center gap-2 w-full border border-gray-300 rounded-md px-3 py-2">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search vehicles by name, ID, or type..."
            value={searchTerm}
            onChange={onSearchChange}
            className="flex-1 border-none outline-none text-sm"
          />
          {searchTerm && (
            <button
              onClick={onClearSearch}
              aria-label="Clear search"
              className="text-gray-500 hover:text-red-500"
            >
              <XCircle size={16} />
            </button>
          )}
          <button
            onClick={handleRefreshClick}
            aria-label="Refresh data"
            title="Refresh data"
            className={`text-gray-500 hover:text-blue-500 ${refreshing ? 'animate-spin' : ''}`}
          >
            
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-gray-700 font-semibold text-base">
          <Filter size={16} />
          <span>Filter Vehicles</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(safeFilterOptions).map(([key, options]) => (
            <div key={key} className="flex flex-col gap-1">
              <label htmlFor={`${key}-filter`} className="text-sm font-medium text-gray-600">
                {key === 'sortBy' ? 'Sort By' : key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <select
                id={`${key}-filter`}
                value={filters[key] || ''}
                onChange={(e) => onFilterChange({ ...filters, [key]: e.target.value })}
                className="p-2 border border-gray-300 rounded-md text-sm"
              >
                {options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClearFilters}
            title="Clear all filters"
            className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSearchBar;
