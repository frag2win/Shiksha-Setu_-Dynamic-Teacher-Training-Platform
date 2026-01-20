import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, TrendingUp, Filter, ChevronDown } from 'lucide-react';
import { getRecommendations, updateRecommendationStatus } from '../services/api';

const TrainingBacklog = ({ clusterId = null }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'pending', priority: null });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [clusterId, filter]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (clusterId) params.cluster_id = clusterId;
      if (filter.status) params.status = filter.status;
      if (filter.priority) params.priority = filter.priority;

      const response = await getRecommendations(params);
      setRecommendations(response.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateRecommendationStatus(id, newStatus);
      fetchRecommendations();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'implemented':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Training Backlog</h2>
          <p className="text-sm text-gray-600 mt-1">
            AI-recommended training priorities based on cluster needs
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          Filters
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filter.status || ''}
              onChange={(e) => setFilter({ ...filter, status: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="implemented">Implemented</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filter.priority || ''}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      )}

      {/* Recommendations List */}
      {recommendations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No recommendations found</p>
          <p className="text-sm mt-2">Run cluster analysis to generate recommendations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(rec.status)}
                    <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Cluster: <span className="font-medium">{rec.cluster_name}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                    {rec.priority.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    Score: {rec.priority_score}
                  </span>
                </div>
              </div>

              {/* Rationale */}
              <p className="text-sm text-gray-700 mb-3">{rec.rationale}</p>

              {/* Detected Issues */}
              {rec.detected_issues && rec.detected_issues.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">Detected Issues:</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.detected_issues.map((issue, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded border border-orange-200"
                      >
                        {issue.type || issue}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {rec.status === 'pending' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleStatusChange(rec.id, 'approved')}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(rec.id, 'rejected')}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                  >
                    Reject
                  </button>
                </div>
              )}

              {rec.status === 'approved' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleStatusChange(rec.id, 'implemented')}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Mark as Implemented
                  </button>
                </div>
              )}

              {/* Timestamp */}
              <p className="text-xs text-gray-500 mt-2">
                Created: {new Date(rec.created_at).toLocaleDateString()}
                {rec.reviewed_at && ` • Reviewed: ${new Date(rec.reviewed_at).toLocaleDateString()}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingBacklog;
