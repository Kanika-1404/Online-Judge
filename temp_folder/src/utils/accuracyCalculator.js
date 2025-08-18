/**
 * Enhanced utility functions for calculating user accuracy based on submissions
 * with support for different accuracy metrics and real-time data
 */

export const calculateAccuracy = (submissions, options = {}) => {
  const {
    includePending = false,
    weightByDifficulty = false,
    includeTimeDecay = false
  } = options;

  if (!submissions || submissions.length === 0) {
    return {
      accuracy: 0,
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      rejectedSubmissions: 0,
      pendingSubmissions: 0
    };
  }

  const totalSubmissions = submissions.length;
  const acceptedSubmissions = submissions.filter(
    sub => sub.verdict === 'Accepted'
  ).length;
  const rejectedSubmissions = submissions.filter(
    sub => sub.verdict === 'Wrong Answer' || sub.verdict === 'Rejected'
  ).length;
  const pendingSubmissions = includePending ? submissions.filter(
    sub => !sub.verdict || sub.verdict === 'Pending'
  ).length : 0;

  // Basic accuracy
  const accuracy = totalSubmissions > 0 
    ? Math.round((acceptedSubmissions / totalSubmissions) * 100) 
    : 0;

  return {
    accuracy,
    totalSubmissions,
    acceptedSubmissions,
    rejectedSubmissions,
    pendingSubmissions
  };
};

export const calculateQuestionAccuracy = (questionSubmissions) => {
  if (!questionSubmissions || questionSubmissions.length === 0) {
    return {
      accuracy: 0,
      totalAttempts: 0,
      successfulAttempts: 0,
      averageScore: 0
    };
  }

  const totalAttempts = questionSubmissions.length;
  const successfulAttempts = questionSubmissions.filter(
    sub => sub.verdict === 'Accepted'
  ).length;
  
  const totalScore = questionSubmissions.reduce(
    (sum, sub) => sum + (sub.score || 0), 0
  );
  const averageScore = totalAttempts > 0 
    ? Math.round(totalScore / totalAttempts) 
    : 0;

  const accuracy = totalAttempts > 0 
    ? Math.round((successfulAttempts / totalAttempts) * 100) 
    : 0;

  return {
    accuracy,
    totalAttempts,
    successfulAttempts,
    averageScore
  };
};

export const formatAccuracy = (accuracy) => {
  return `${accuracy}%`;
};
