import React, { useState, useEffect } from 'react';
import { 
  Target, TrendingUp, Award, BookOpen, AlertCircle, 
  CheckCircle, Clock, Star, BarChart3, Activity 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as api from '../../services/api';

export default function CompetencyDashboard() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [completions, setCompletions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    loadCompetencyData();
  }, []);

  const loadCompetencyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [analysisData, completionsData, leaderboardData] = await Promise.all([
        api.getCompetencyAnalysis(),
        api.getModuleCompletions(),
        api.getCompetencyLeaderboard()
      ]);
      
      setAnalysis(analysisData);
      setCompletions(completionsData.completions || []);
      setLeaderboard(leaderboardData.leaderboard || []);
    } catch (error) {
      console.error('Error loading competency data:', error);
      const errorDetails = {
        message: error.response?.data?.detail || error.message || 'Unknown error occurred',
        status: error.response?.status,
        url: error.config?.url
      };
      setError(errorDetails);
      
      // Show push notification with error details
      toast.error(
        `Failed to load competency data: ${errorDetails.message}${errorDetails.status ? ` (Status: ${errorDetails.status})` : ''}`,
        {
          duration: 8000,
          position: 'top-right',
          style: {
            background: '#fee',
            color: '#c00',
            border: '2px solid #fcc',
            padding: '16px',
            maxWidth: '500px'
          }
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const getCompetencyColor = (level) => {
    const colors = {
      beginner: 'bg-gray-100 text-gray-700',
      intermediate: 'bg-blue-100 text-blue-700',
      advanced: 'bg-purple-100 text-purple-700',
      expert: 'bg-green-100 text-green-700'
    };
    return colors[level] || colors.beginner;
  };

  const getGapColor = (level) => {
    const colors = {
      critical: 'bg-red-100 text-red-700 border-red-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-blue-100 text-blue-700 border-blue-300'
    };
    return colors[level] || colors.medium;
  };

  const getLevelProgress = (level) => {
    const progress = {
      beginner: 25,
      intermediate: 50,
      advanced: 75,
      expert: 100
    };
    return progress[level] || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading competency analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-2xl w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Unable to Load Competency Dashboard
              </h2>
              
              {error && (
                <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-lg p-6 text-left">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Error Details:
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <strong>Message:</strong> {error.message}
                    </p>
                    {error.status && (
                      <p className="text-gray-700">
                        <strong>Status Code:</strong> {error.status}
                      </p>
                    )}
                    {error.url && (
                      <p className="text-gray-700">
                        <strong>Endpoint:</strong> {error.url}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-left">
                <h3 className="font-semibold text-blue-800 mb-3">Troubleshooting Steps:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Verify your user role (must be TEACHER, PRINCIPAL, or ADMIN)</li>
                  <li>Ensure the backend server is running and up-to-date</li>
                  <li>Try hard refreshing the page (Ctrl+Shift+R or Ctrl+F5)</li>
                  <li>Clear browser cache and cookies</li>
                  <li>Check browser console for additional errors (F12)</li>
                </ol>
              </div>

              <button
                onClick={loadCompetencyData}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Competency Dashboard
          </h1>
          <p className="text-gray-600">
            Track your teaching competencies and get personalized recommendations
          </p>
        </div>

        {/* Overall Score Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Overall Competency Score</h2>
              <p className="text-blue-100">Based on {analysis.progress.total_modules_completed} completed modules</p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold">{analysis.overall_score}</div>
              <div className="text-blue-100 text-sm">out of 100</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6 bg-blue-700 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${analysis.overall_score}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', label: 'Overview', icon: Target },
                { id: 'gaps', label: 'Competency Gaps', icon: AlertCircle },
                { id: 'recommendations', label: 'Recommendations', icon: BookOpen },
                { id: 'progress', label: 'My Progress', icon: TrendingUp },
                { id: 'leaderboard', label: 'Leaderboard', icon: Award }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Competency Levels</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.entries(analysis.competency_levels).map(([area, data]) => (
                    <div key={area} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{area}</h4>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getCompetencyColor(data.level)}`}>
                            {data.level.charAt(0).toUpperCase() + data.level.slice(1)}
                          </span>
                        </div>
                        <Activity className="w-8 h-8 text-gray-400" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-gray-900">{getLevelProgress(data.level)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${getLevelProgress(data.level)}%` }}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                          <div>
                            <div className="text-xs text-gray-500">Modules</div>
                            <div className="text-lg font-semibold text-gray-900">{data.modules_completed}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Avg Score</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {data.average_score > 0 ? data.average_score.toFixed(1) : 'N/A'}/5
                            </div>
                          </div>
                        </div>
                        
                        {data.last_activity && (
                          <div className="text-xs text-gray-500 pt-2">
                            Last activity: {new Date(data.last_activity).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gaps Tab */}
            {activeTab === 'gaps' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Identified Competency Gaps</h3>
                  <span className="text-sm text-gray-600">
                    {analysis.identified_gaps.length} gap{analysis.identified_gaps.length !== 1 ? 's' : ''} found
                  </span>
                </div>

                {analysis.identified_gaps.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Critical Gaps Identified!
                    </h3>
                    <p className="text-gray-600">
                      You're maintaining good progress across all competency areas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analysis.identified_gaps.map((gap, index) => (
                      <div 
                        key={index}
                        className={`border-2 rounded-lg p-6 ${getGapColor(gap.gap_level)}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-lg">{gap.competency_area}</h4>
                            <span className="text-sm font-medium">
                              Gap Level: {gap.gap_level.charAt(0).toUpperCase() + gap.gap_level.slice(1)}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">Priority</div>
                            <div className="text-2xl font-bold">{gap.priority}/100</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                          <div>
                            <div className="font-medium">Current Level</div>
                            <div>{gap.current_level}</div>
                          </div>
                          <div>
                            <div className="font-medium">Modules Done</div>
                            <div>{gap.modules_completed}</div>
                          </div>
                          <div>
                            <div className="font-medium">Avg Score</div>
                            <div>{gap.average_score > 0 ? gap.average_score.toFixed(1) : 'N/A'}/5</div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="font-medium text-sm mb-2">Reasons:</div>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {gap.reasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Personalized Module Recommendations</h3>
                
                {analysis.recommended_modules.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Recommendations Yet
                    </h3>
                    <p className="text-gray-600">
                      Complete more modules to receive personalized recommendations.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {analysis.recommended_modules.map((rec, index) => (
                      <div 
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 mb-1">{rec.module_title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {rec.competency_area}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {rec.cluster_name}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-5 h-5 fill-current" />
                            <span className="font-semibold">{rec.average_rating.toFixed(1)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-gray-500">
                            Addresses: <span className={`font-medium ${rec.gap_level === 'high' ? 'text-red-600' : 'text-orange-600'}`}>
                              {rec.gap_level} priority gap
                            </span>
                          </div>
                          <button 
                            onClick={() => window.location.href = `/library?module=${rec.module_id}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            View Module
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">My Learning Progress</h3>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <BookOpen className="w-8 h-8 text-blue-600" />
                      <div className="text-3xl font-bold text-blue-600">
                        {analysis.progress.total_modules_completed}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Total Modules Completed</div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                      <div className="text-3xl font-bold text-green-600">
                        {analysis.progress.completion_rate}%
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Completion Rate</div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-8 h-8 text-purple-600" />
                      <div className="text-3xl font-bold text-purple-600">
                        {Object.keys(analysis.progress.modules_per_competency).length}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Active Competency Areas</div>
                  </div>
                </div>

                {/* Modules per Competency */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Modules Completed by Competency</h4>
                  <div className="space-y-4">
                    {Object.entries(analysis.progress.modules_per_competency).map(([area, count]) => (
                      <div key={area}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">{area}</span>
                          <span className="text-sm font-semibold text-gray-900">{count} modules</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((count / 15) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Completions */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Recent Completions</h4>
                  {completions.filter(c => c.completion_status === 'completed').slice(0, 5).length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No completed modules yet</p>
                  ) : (
                    <div className="space-y-3">
                      {completions.filter(c => c.completion_status === 'completed').slice(0, 5).map(comp => (
                        <div key={comp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{comp.module_title}</div>
                            <div className="text-sm text-gray-600">
                              Completed: {new Date(comp.completed_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {comp.self_assessment_score && (
                              <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-semibold">{comp.self_assessment_score}/5</span>
                              </div>
                            )}
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{comp.time_spent} min</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Top Performers</h3>
                
                {leaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Leaderboard data not available</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Competency</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modules</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {leaderboard.map(entry => (
                          <tr key={`${entry.rank}-${entry.teacher_name}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                {entry.rank <= 3 && (
                                  <Award className={`w-5 h-5 mr-2 ${
                                    entry.rank === 1 ? 'text-yellow-500' :
                                    entry.rank === 2 ? 'text-gray-400' :
                                    'text-orange-400'
                                  }`} />
                                )}
                                <span className="font-semibold text-gray-900">{entry.rank}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">{entry.teacher_name}</td>
                            <td className="px-6 py-4 text-gray-600">{entry.competency_area}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompetencyColor(entry.level)}`}>
                                {entry.level}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-900">{entry.modules_completed}</td>
                            <td className="px-6 py-4 text-gray-900">{entry.average_score.toFixed(1)}/5</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
