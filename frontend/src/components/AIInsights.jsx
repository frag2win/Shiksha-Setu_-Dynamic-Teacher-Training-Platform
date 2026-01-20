import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, RefreshCw } from 'lucide-react';
import { analyzeAllClusters, getMacroInsights } from '../services/api';

const AIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await getMacroInsights();
      setInsights(response.insights);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await analyzeAllClusters();
      setAnalyses(response.analyses || []);
      await fetchInsights(); // Refresh insights after analysis
    } catch (error) {
      console.error('Error running analysis:', error);
    } finally {
      setAnalyzing(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-8 h-8" />
              <h2 className="text-2xl font-bold">AI Decision Intelligence</h2>
            </div>
            <p className="text-blue-100">
              AI-powered analysis of training needs across all clusters
            </p>
          </div>
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <RefreshCw className={`w-5 h-5 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {/* Macro Insights */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Clusters</p>
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{insights.total_clusters}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">High Priority</p>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{insights.high_priority_clusters}</p>
            <p className="text-xs text-gray-500 mt-1">Need immediate attention</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Avg Priority Score</p>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{insights.average_priority_score}</p>
            <p className="text-xs text-gray-500 mt-1">Out of 100</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Systemic Issues</p>
              <Brain className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {insights.top_systemic_issues?.length || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Common patterns detected</p>
          </div>
        </div>
      )}

      {/* Top Systemic Issues */}
      {insights?.top_systemic_issues && insights.top_systemic_issues.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Systemic Issues</h3>
          <div className="space-y-3">
            {insights.top_systemic_issues.map((issue, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {issue.issue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-sm text-gray-600">Affecting {issue.cluster_count} clusters</p>
                  </div>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min((issue.cluster_count / insights.total_clusters) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clusters Needing Attention */}
      {insights?.clusters_needing_attention && insights.clusters_needing_attention.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Clusters Needing Attention</h3>
          <div className="space-y-2">
            {insights.clusters_needing_attention.map((cluster) => (
              <div
                key={cluster.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{cluster.name}</p>
                  <p className="text-sm text-gray-600">Priority Score: {cluster.score}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cluster.score >= 60
                        ? 'bg-red-100 text-red-700'
                        : cluster.score >= 40
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {cluster.score >= 60 ? 'HIGH' : cluster.score >= 40 ? 'MEDIUM' : 'LOW'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Analyses */}
      {analyses.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Analysis Results</h3>
          <div className="text-sm text-gray-600">
            <p>Analyzed {analyses.length} clusters</p>
            <p className="mt-2">
              Generated {analyses.reduce((sum, a) => sum + (a.recommendations?.length || 0), 0)} recommendations
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
