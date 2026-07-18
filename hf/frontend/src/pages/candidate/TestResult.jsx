import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaTrophy } from 'react-icons/fa';
import { getTestResult } from '../../services/candidateTestService';
import Loading from '../../components/Loading';

const TestResult = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResult();
  }, [jobId]);

  const loadResult = async () => {
    try {
      setLoading(true);
      const response = await getTestResult(jobId);
      if (response.data && response.data.success) {
        setSubmission(response.data.data.submission);
      }
    } catch (error) {
      console.error('Error loading test result:', error);
      setError(error.response?.data?.message || 'Error loading test result');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !submission) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Test result not found'}</p>
          <button
            onClick={() => navigate(`/jobs/${jobId}`)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Back to Job
          </button>
        </div>
      </div>
    );
  }

  const score = parseFloat(submission.score);
  const passingPercentage = submission.test?.passingPercentage 
    ? parseFloat(submission.test.passingPercentage) 
    : null;
  const isPassed = submission.isPassed;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/jobs/${jobId}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Back to Job</span>
        </button>
      </div>

      {/* Result Card */}
      <div className="bg-white rounded-xl shadow p-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isPassed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isPassed ? (
              <FaCheckCircle className="w-12 h-12 text-green-600" />
            ) : (
              <FaTimesCircle className="w-12 h-12 text-red-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isPassed ? 'Congratulations!' : 'Test Completed'}
          </h1>
          <p className="text-gray-600">
            {submission.test?.title || 'Aptitude Test'}
          </p>
        </div>

        {/* Score Display */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">
              {score.toFixed(1)}%
            </div>
            <p className="text-gray-600 mb-4">Your Score</p>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div>
                <span className="text-gray-600">Correct Answers: </span>
                <span className="font-semibold text-green-600">{submission.correctAnswers}</span>
              </div>
              <span className="text-gray-400">|</span>
              <div>
                <span className="text-gray-600">Total Questions: </span>
                <span className="font-semibold">{submission.totalQuestions}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Passing Criteria */}
        {passingPercentage !== null && (
          <div className={`rounded-lg p-6 mb-6 ${
            isPassed 
              ? 'bg-green-50 border-2 border-green-200' 
              : 'bg-red-50 border-2 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-lg mb-1 ${
                  isPassed ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isPassed ? 'You Passed!' : 'You Did Not Pass'}
                </p>
                <p className={`text-sm ${
                  isPassed ? 'text-green-700' : 'text-red-700'
                }`}>
                  Passing Grade: {passingPercentage.toFixed(1)}%
                </p>
              </div>
              {isPassed && (
                <FaTrophy className="w-8 h-8 text-yellow-500" />
              )}
            </div>
          </div>
        )}

        {/* Status Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            {isPassed ? (
              <>
                <span className="font-semibold">Great job!</span> Your application has been moved to{' '}
                <span className="font-semibold">"Under Review"</span> status. The recruiter will review your application and test results.
              </>
            ) : passingPercentage !== null ? (
              <>
                <span className="font-semibold">Unfortunately,</span> your score did not meet the passing criteria. 
                Your application status has been updated to <span className="font-semibold">"Rejected"</span>.
              </>
            ) : (
              <>
                Your test has been submitted successfully. The recruiter will review your results.
              </>
            )}
          </p>
        </div>

        {/* Test Details */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-800 mb-3">Test Details</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Submitted on:</span>
              <span className="font-medium">
                {new Date(submission.submittedAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Correct Answers:</span>
              <span className="font-medium text-green-600">
                {submission.correctAnswers} / {submission.totalQuestions}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Score:</span>
              <span className="font-medium">{score.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate(`/jobs/${jobId}`)}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View Job
          </button>
          <button
            onClick={() => navigate('/applications')}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            View Applications
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResult;

