import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { getTestForJob, submitTest } from '../../services/candidateTestService';
import Loading from '../../components/Loading';

const TakeTest = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null); // in seconds
  const [testStartTime, setTestStartTime] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    loadTest();
  }, [jobId]);

  // Timer effect
  useEffect(() => {
    if (test && test.timeLimit && testStartTime && !isTimeUp) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - testStartTime) / 1000);
        const totalSeconds = test.timeLimit * 60;
        const remaining = Math.max(0, totalSeconds - elapsed);
        
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          setIsTimeUp(true);
          clearInterval(interval);
          // Auto-submit when time runs out
          handleAutoSubmit();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test, testStartTime, isTimeUp]);

  // Initialize timer when test loads
  useEffect(() => {
    if (test && test.timeLimit && !testStartTime && !isTimeUp) {
      setTestStartTime(Date.now());
      setTimeRemaining(test.timeLimit * 60);
    }
  }, [test, testStartTime, isTimeUp]);

  const loadTest = async () => {
    try {
      setLoading(true);
      const response = await getTestForJob(jobId);
      if (response.data && response.data.success) {
        setTest(response.data.data.test);
        setApplicationId(response.data.data.applicationId);
        // Initialize answers object
        const initialAnswers = {};
        response.data.data.test.questions?.forEach((q) => {
          initialAnswers[q.id] = null;
        });
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error('Error loading test:', error);
      setError(error.response?.data?.message || 'Error loading test');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const getAnswerLabel = (index) => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  const validateAnswers = () => {
    const unanswered = test.questions.filter(q => answers[q.id] === null || answers[q.id] === undefined);
    if (unanswered.length > 0) {
      setError(`Please answer all questions. ${unanswered.length} question(s) remaining.`);
      return false;
    }
    return true;
  };

  const handleAutoSubmit = async () => {
    if (isTimeUp || submitting) return;
    
    setIsTimeUp(true);
    setError('Time is up! Your test is being submitted automatically.');
    
    try {
      setSubmitting(true);
      // Submit with whatever answers are available
      const response = await submitTest(jobId, answers, applicationId);
      if (response.data && response.data.success) {
        // Navigate to result page
        navigate(`/jobs/${jobId}/test-result`);
      }
    } catch (error) {
      console.error('Error auto-submitting test:', error);
      setError('Time is up! Error submitting test: ' + (error.response?.data?.message || 'Please contact support.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setError('');

    if (isTimeUp) {
      return; // Don't allow manual submit if time is up
    }

    if (!validateAnswers()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await submitTest(jobId, answers, applicationId);
      if (response.data && response.data.success) {
        // Navigate to result page
        navigate(`/jobs/${jobId}/test-result`);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      setError(error.response?.data?.message || 'Error submitting test');
    } finally {
      setSubmitting(false);
    }
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter(a => a !== null && a !== undefined).length;
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (!timeRemaining) return 'text-gray-600';
    const totalSeconds = test?.timeLimit ? test.timeLimit * 60 : 0;
    const percentage = (timeRemaining / totalSeconds) * 100;
    if (percentage <= 10) return 'text-red-600 font-bold';
    if (percentage <= 25) return 'text-orange-600 font-semibold';
    return 'text-gray-600';
  };

  if (loading) {
    return <Loading />;
  }

  if (error && !test) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
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

  if (!test) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-600 text-lg">Test not found</p>
        </div>
      </div>
    );
  }

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
        <div className="bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{test.title}</h1>
          {test.job && (
            <p className="text-gray-600 text-sm mb-4">
              Job: <span className="font-medium">{test.job.title}</span> - {test.job.companyName}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>{test.numberOfQuestions} questions</span>
              {test.passingPercentage !== null && (
                <span>
                  Passing Grade: <span className="font-medium text-primary">{parseFloat(test.passingPercentage).toFixed(1)}%</span>
                </span>
              )}
              {test.timeLimit && (
                <span>
                  Time Limit: <span className="font-medium">{test.timeLimit} minutes</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {test.timeLimit && timeRemaining !== null && (
                <div className={`text-lg font-mono ${getTimeColor()}`}>
                  <span className="font-semibold">Time: </span>
                  {isTimeUp ? (
                    <span className="text-red-600 font-bold">00:00</span>
                  ) : (
                    <span>{formatTime(timeRemaining)}</span>
                  )}
                </div>
              )}
              <div className="text-sm text-gray-600">
                <span className="font-medium">{getAnsweredCount()}</span> / {test.numberOfQuestions} answered
              </div>
            </div>
          </div>
          {test.passingPercentage !== null && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Note:</span> You need to score above{' '}
                <span className="font-bold">{parseFloat(test.passingPercentage).toFixed(1)}%</span> to be shortlisted for this position.
              </p>
            </div>
          )}
          {test.timeLimit && timeRemaining !== null && timeRemaining > 0 && timeRemaining <= 60 && !isTimeUp && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-semibold">
                ⚠️ Warning: Less than 1 minute remaining! Please submit your answers soon.
              </p>
            </div>
          )}
          {isTimeUp && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-semibold">
                ⏰ Time is up! Your test is being submitted automatically...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Test Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-8">
            {test.questions && test.questions.length > 0 ? (
              test.questions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="mb-4">
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-lg font-medium text-gray-800 mb-1">
                          {question.question}
                        </p>
                        {question.category && (
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {question.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-11 space-y-3">
                    {question.options && question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          answers[question.id] === optionIndex
                            ? 'border-primary bg-primary bg-opacity-5'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={optionIndex}
                          checked={answers[question.id] === optionIndex}
                          onChange={() => handleAnswerChange(question.id, optionIndex)}
                          className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                        />
                        <span className="font-medium text-gray-700 w-6">
                          {getAnswerLabel(optionIndex)}.
                        </span>
                        <span className="flex-1 text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No questions found in this test.</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{getAnsweredCount()}</span> / {test.numberOfQuestions} questions answered
            </div>
            <button
              type="submit"
              disabled={submitting || isTimeUp || getAnsweredCount() < test.numberOfQuestions}
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  <span>Submit Test</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TakeTest;

