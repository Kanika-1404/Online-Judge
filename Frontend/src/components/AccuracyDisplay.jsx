import React from 'react';
import { formatAccuracy } from '../utils/accuracyCalculator';

const AccuracyDisplay = ({ accuracyData, type = 'user' }) => {
  if (!accuracyData) return null;

  const {
    accuracy,
    totalSubmissions,
    acceptedSubmissions,
    rejectedSubmissions,
    pendingSubmissions
  } = accuracyData;

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyLabel = (accuracy) => {
    if (accuracy >= 80) return 'Excellent';
    if (accuracy >= 60) return 'Good';
    if (accuracy >= 40) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        {type === 'user' ? 'Overall Accuracy' : 'Question Accuracy'}
      </h3>
      
      <div className="text-center mb-4">
        <div className={`text-3xl font-bold ${getAccuracyColor(accuracy)}`}>
          {formatAccuracy(accuracy)}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {getAccuracyLabel(accuracy)}
        </p>
      </div>

      {/* <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600 dark:text-gray-400">Total Submissions</p>
          <p className="font-semibold text-gray-800 dark:text-gray-200">{totalSubmissions}</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Accepted</p>
          <p className="font-semibold text-green-600">{acceptedSubmissions}</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Rejected</p>
          <p className="font-semibold text-red-600">{rejectedSubmissions}</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Pending</p>
          <p className="font-semibold text-yellow-600">{pendingSubmissions}</p>
        </div>
      </div> */}

      {type === 'question' && accuracyData.averageScore !== undefined && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
          <p className="font-semibold text-gray-800 dark:text-gray-200">
            {accuracyData.averageScore}%
          </p>
        </div>
      )}
    </div>
  );
};

export default AccuracyDisplay;
