import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderCardSkeleton = () => (
    <div className="worker-card skeleton-card">
      <div className="worker-card-header">
        <div className="skeleton-avatar loading-skeleton"></div>
        <div className="skeleton-info">
          <div className="skeleton-title loading-skeleton"></div>
          <div className="skeleton-subtitle loading-skeleton"></div>
          <div className="skeleton-badge loading-skeleton"></div>
        </div>
      </div>
      <div className="worker-card-body">
        <div className="skeleton-line loading-skeleton"></div>
        <div className="skeleton-line loading-skeleton"></div>
        <div className="skeleton-line loading-skeleton"></div>
        <div className="skeleton-stats">
          <div className="skeleton-stat loading-skeleton"></div>
          <div className="skeleton-stat loading-skeleton"></div>
          <div className="skeleton-stat loading-skeleton"></div>
        </div>
      </div>
      <div className="worker-card-footer">
        <div className="skeleton-button loading-skeleton"></div>
        <div className="skeleton-button loading-skeleton"></div>
        <div className="skeleton-button loading-skeleton"></div>
        <div className="skeleton-button loading-skeleton"></div>
      </div>
    </div>
  );

  const renderTableRowSkeleton = () => (
    <tr className="skeleton-row">
      <td>
        <div className="skeleton-cell loading-skeleton"></div>
      </td>
      <td>
        <div className="skeleton-cell loading-skeleton"></div>
      </td>
      <td>
        <div className="skeleton-cell loading-skeleton"></div>
      </td>
      <td>
        <div className="skeleton-cell loading-skeleton"></div>
      </td>
      <td>
        <div className="skeleton-cell loading-skeleton"></div>
      </td>
      <td>
        <div className="skeleton-cell loading-skeleton"></div>
      </td>
      <td>
        <div className="skeleton-cell loading-skeleton"></div>
      </td>
      <td>
        <div className="skeleton-actions">
          <div className="skeleton-action loading-skeleton"></div>
          <div className="skeleton-action loading-skeleton"></div>
          <div className="skeleton-action loading-skeleton"></div>
        </div>
      </td>
    </tr>
  );

  const renderStatSkeleton = () => (
    <div className="stat-card skeleton-stat-card">
      <div className="skeleton-stat-icon loading-skeleton"></div>
      <div className="skeleton-stat-info">
        <div className="skeleton-stat-value loading-skeleton"></div>
        <div className="skeleton-stat-label loading-skeleton"></div>
      </div>
    </div>
  );

  const renderSkeletonsByType = () => {
    switch (type) {
      case 'card':
        return Array(count).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {renderCardSkeleton()}
          </React.Fragment>
        ));
      case 'table-row':
        return Array(count).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {renderTableRowSkeleton()}
          </React.Fragment>
        ));
      case 'stat':
        return Array(count).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {renderStatSkeleton()}
          </React.Fragment>
        ));
      default:
        return null;
    }
  };

  return (
    <>
      {renderSkeletonsByType()}
    </>
  );
};

export default SkeletonLoader; 