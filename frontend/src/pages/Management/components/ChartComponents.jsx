import React from 'react';
import { format } from 'date-fns';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Star, CheckSquare, TrendingUp, ThumbsUp, Clock } from 'lucide-react';

// Performance metrics component to be lazy loaded
const ChartComponents = ({ performanceData, timeframe }) => {
  if (!performanceData) return null;

  const {
    taskCompletion,
    efficiency,
    customerRatings,
    timeManagement
  } = performanceData;

  return (
    <div className="performance-metrics">
      <div className="metric-row">
        <div className="metric-card">
          <div className="metric-header">
            <CheckSquare size={20} className="metric-icon success" />
            <h4>Task Completion</h4>
          </div>
          <div className="metric-stats">
            <div className="stat-item">
              <span className="label">Completion Rate</span>
              <span className="value">{taskCompletion?.rate || 0}%</span>
            </div>
            <div className="stat-item">
              <span className="label">Tasks Completed</span>
              <span className="value">{taskCompletion?.completed || 0}/{taskCompletion?.total || 0}</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <TrendingUp size={20} className="metric-icon info" />
            <h4>Efficiency</h4>
          </div>
          <div className="metric-stats">
            <div className="stat-item">
              <span className="label">Average Time per Task</span>
              <span className="value">{efficiency?.avgTimePerTask || 0} mins</span>
            </div>
            <div className="stat-item">
              <span className="label">Tasks per Day</span>
              <span className="value">{efficiency?.tasksPerDay || 0}</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <ThumbsUp size={20} className="metric-icon warning" />
            <h4>Customer Ratings</h4>
          </div>
          <div className="metric-stats">
            <div className="stat-item">
              <span className="label">Average Rating</span>
              <div className="rating-display">
                <Star size={16} className="star-icon" />
                <span className="value">{customerRatings?.average || 0}/5.0</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="label">Total Reviews</span>
              <span className="value">{customerRatings?.total || 0}</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Clock size={20} className="metric-icon neutral" />
            <h4>Time Management</h4>
          </div>
          <div className="metric-stats">
            <div className="stat-item">
              <span className="label">On-Time Arrival</span>
              <span className="value">{timeManagement?.onTimeRate || 0}%</span>
            </div>
            <div className="stat-item">
              <span className="label">Average Delay</span>
              <span className="value">{timeManagement?.avgDelay || 0} mins</span>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h4>Task Completion Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData.trends?.taskCompletion || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  try {
                    return format(new Date(value), timeframe === 'week' ? 'EEE' : timeframe === 'month' ? 'dd' : 'MMM');
                  } catch (e) {
                    return value;
                  }
                }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value}`, '']}
                labelFormatter={(label) => {
                  try {
                    return format(new Date(label), 'MMM dd, yyyy');
                  } catch (e) {
                    return label;
                  }
                }}
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: 10 }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#4CAF50"
                name="Completed Tasks"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 1 }}
                activeDot={{ r: 6, stroke: '#4CAF50', strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={800}
              />
              <Line
                type="monotone"
                dataKey="assigned"
                stroke="#2196F3"
                name="Assigned Tasks"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 1 }}
                activeDot={{ r: 6, stroke: '#2196F3', strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={800}
                animationBegin={200}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h4>Rating Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData.trends?.ratingDistribution || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="rating" 
                tickFormatter={(value) => `${value}/5`}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} ratings`, '']}
                labelFormatter={(label) => `Rating: ${label}/5.0`}
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: 10 }}
              />
              <Bar 
                dataKey="count" 
                fill="#FFA000" 
                name="Number of Ratings" 
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Peer Comparison Section */}
      <div className="peer-comparison">
        <h4>Peer Comparison</h4>
        <div className="comparison-stats">
          <div className="comparison-item">
            <div className="comparison-label">
              <span>Task Efficiency</span>
              <div className="indicator above-average">Above Average</div>
            </div>
            <div className="comparison-bar">
              <div className="comparison-track">
                <div 
                  className="comparison-progress above-average" 
                  style={{ width: `${Math.min(100, (efficiency?.tasksPerDay || 0) / 5 * 100)}%` }}
                />
                <div className="team-average-marker" style={{ left: '60%' }} />
              </div>
              <div className="comparison-labels">
                <span>You</span>
                <span>Team Average</span>
              </div>
            </div>
          </div>
          
          <div className="comparison-item">
            <div className="comparison-label">
              <span>Customer Satisfaction</span>
              <div className="indicator average">Average</div>
            </div>
            <div className="comparison-bar">
              <div className="comparison-track">
                <div 
                  className="comparison-progress average" 
                  style={{ width: `${Math.min(100, (customerRatings?.average || 0) / 5 * 100)}%` }}
                />
                <div className="team-average-marker" style={{ left: '80%' }} />
              </div>
              <div className="comparison-labels">
                <span>You</span>
                <span>Team Average</span>
              </div>
            </div>
          </div>
          
          <div className="comparison-item">
            <div className="comparison-label">
              <span>On-Time Performance</span>
              <div className="indicator below-average">Below Average</div>
            </div>
            <div className="comparison-bar">
              <div className="comparison-track">
                <div 
                  className="comparison-progress below-average" 
                  style={{ width: `${Math.min(100, (timeManagement?.onTimeRate || 0))}%` }}
                />
                <div className="team-average-marker" style={{ left: '90%' }} />
              </div>
              <div className="comparison-labels">
                <span>You</span>
                <span>Team Average</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges & Achievements */}
      <div className="badges-achievements">
        <h4>Badges & Achievements</h4>
        <div className="badges-grid">
          {performanceData.badges?.map((badge, index) => (
            <div key={index} className={`badge-item ${badge.earned ? 'earned' : 'locked'}`}>
              <div className="badge-icon">
                {badge.icon || '🏆'}
              </div>
              <div className="badge-info">
                <h5>{badge.name || 'Achievement'}</h5>
                <p>{badge.description || 'Complete specific tasks to earn this badge'}</p>
                {badge.earned ? (
                  <span className="earned-date">Earned {badge.earnedDate || 'recently'}</span>
                ) : (
                  <span className="progress">{badge.progress || 0}% complete</span>
                )}
              </div>
            </div>
          )) || (
            <div className="empty-badges">
              <p>No badges available yet. Complete tasks to earn badges!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartComponents; 