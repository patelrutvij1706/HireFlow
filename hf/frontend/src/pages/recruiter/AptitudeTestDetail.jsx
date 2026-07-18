import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { getAptitudeTest } from '../../services/aptitudeTestService';
import Loading from '../../components/Loading';

const AptitudeTestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    loadTest();
  }, [id]);

  const loadTest = async () => {
    try {
      setLoading(true);
      const response = await getAptitudeTest(id);
      if (response.data && response.data.success) {
        const testData = response.data.data.test;
        setTest(testData);
        // Initialize answers object
        const initialAnswers = {};
        testData.questions?.forEach((q) => {
          initialAnswers[q.id] = null;
        });
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error('Error loading aptitude test:', error);
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

  const getCorrectAnswerLabel = (correctAnswerIndex) => {
    return String.fromCharCode(65 + correctAnswerIndex);
  };

  if (loading) {
    return <Loading />;
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
          onClick={() => navigate('/recruiter/aptitude-tests')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Back to Tests</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{test.title}</h1>
        {test.job && (
          <p className="text-gray-600 text-sm">
            Job: <span className="font-medium">{test.job.title}</span> - {test.job.companyName}
          </p>
        )}
               <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
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
                 <span>Created on {new Date(test.createdAt).toLocaleDateString()}</span>
               </div>
        {test.passingPercentage !== null && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Shortlisting Criteria:</span> Candidates who score above{' '}
              <span className="font-bold">{parseFloat(test.passingPercentage).toFixed(1)}%</span> will be shortlisted for this position.
            </p>
          </div>
        )}
      </div>

      {/* Test Form */}
      <div className="bg-white rounded-xl shadow p-6">
        <form>
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
                        {answers[question.id] === optionIndex && (
                          <span className="text-xs text-primary font-medium">Selected</span>
                        )}
                      </label>
                    ))}
                  </div>

                  {/* Show correct answer (for recruiter view) */}
                  <div className="ml-11 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-green-700">Correct Answer:</span>{' '}
                      <span className="font-medium">
                        {getCorrectAnswerLabel(question.correctAnswer)}. {question.options[question.correctAnswer]}
                      </span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No questions found in this test.</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AptitudeTestDetail;

