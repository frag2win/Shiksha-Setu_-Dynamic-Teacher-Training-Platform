import React, { useState } from 'react';
import { CheckCircle, Star, Clock } from 'lucide-react';
import { completeModule, startModule } from '../../services/api';
import toast from 'react-hot-toast';

/**
 * Module Completion Tracker Component
 * Tracks when users complete modules and updates their competency levels
 */
export function ModuleCompletionTracker({ moduleId, moduleName, onComplete }) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [completionData, setCompletionData] = useState({
    timeSpent: 0,
    selfAssessment: 0,
    notes: ''
  });

  const handleStartModule = async () => {
    try {
      await startModule(moduleId);
      toast.success('Module started! We\'re tracking your progress.');
    } catch (error) {
      console.error('Error starting module:', error);
      // Don't show error - it's not critical
    }
  };

  const handleCompleteModule = async () => {
    setShowCompletionForm(true);
  };

  const submitCompletion = async () => {
    if (completionData.selfAssessment === 0) {
      toast.error('Please provide a self-assessment rating');
      return;
    }

    try {
      setIsCompleting(true);
      await completeModule(moduleId, {
        time_spent: completionData.timeSpent,
        self_assessment_score: completionData.selfAssessment,
        notes: completionData.notes
      });
      
      toast.success('🎉 Module completed! Your competency levels have been updated.');
      setShowCompletionForm(false);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error completing module:', error);
      toast.error('Failed to save completion. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-3">
      {!showCompletionForm ? (
        <div className="flex gap-2">
          <button
            onClick={handleStartModule}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Start Learning
          </button>
          
          <button
            onClick={handleCompleteModule}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Mark as Complete
          </button>
        </div>
      ) : (
        <div className="bg-white border-2 border-green-200 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Complete Module: {moduleName}</h4>
          
          {/* Time Spent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Spent (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={completionData.timeSpent}
              onChange={(e) => setCompletionData({
                ...completionData,
                timeSpent: parseInt(e.target.value) || 0
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., 30"
            />
          </div>

          {/* Self-Assessment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Self-Assessment Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setCompletionData({
                    ...completionData,
                    selfAssessment: rating
                  })}
                  className={`flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all ${
                    completionData.selfAssessment >= rating
                      ? 'bg-yellow-400 border-yellow-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-400 hover:border-yellow-400'
                  }`}
                >
                  <Star className={`w-6 h-6 ${completionData.selfAssessment >= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Rate your understanding: 1 = Basic, 5 = Mastered
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={completionData.notes}
              onChange={(e) => setCompletionData({
                ...completionData,
                notes: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="What did you learn? Any challenges?"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={submitCompletion}
              disabled={isCompleting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Complete Module
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowCompletionForm(false)}
              disabled={isCompleting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModuleCompletionTracker;
