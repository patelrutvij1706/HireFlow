import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEye, FaSpinner, FaFileAlt } from 'react-icons/fa';
import { getRecruiterAptitudeTests, deleteAptitudeTest } from '../../services/aptitudeTestService';
import Loading from '../../components/Loading';

const AptitudeTests = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const response = await getRecruiterAptitudeTests();
      if (response.data && response.data.success) {
        setTests(response.data.data.tests || []);
      } else {
        console.error('Unexpected response format:', response);
      }
    } catch (error) {
      console.error('Error loading aptitude tests:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (testId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this aptitude test?')) {
      return;
    }

    try {
      setDeletingId(testId);
      await deleteAptitudeTest(testId);
      setTests(tests.filter(test => test.id !== testId));
    } catch (error) {
      console.error('Error deleting test:', error);
      alert('Error deleting test. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Aptitude Tests</h1>
        <p className="text-gray-600 text-sm">View and manage all generated aptitude tests</p>
      </div>

      {/* Tests List */}
      {tests.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <FaFileAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No aptitude tests found</p>
          <p className="text-gray-500 text-sm">
            Generate aptitude tests when posting new jobs to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => (
            <div
              key={test.id}
              onClick={() => navigate(`/recruiter/aptitude-tests/${test.id}`)}
              className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{test.title}</h3>
                  </div>
                  {test.job && (
                    <p className="text-gray-600 mb-2">
                      Job: <span className="font-medium">{test.job.title}</span> - {test.job.companyName}
                    </p>
                  )}
                         <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                           <span>
                             <span className="font-medium">{test.numberOfQuestions}</span> questions
                           </span>
                           {test.passingPercentage !== null && (
                             <span>
                               Passing: <span className="font-medium">{parseFloat(test.passingPercentage).toFixed(1)}%</span>
                             </span>
                           )}
                           {test.timeLimit && (
                             <span>
                               Time Limit: <span className="font-medium">{test.timeLimit} min</span>
                             </span>
                           )}
                           <span>
                             Created on {formatDate(test.createdAt)}
                           </span>
                         </div>
                  {test.questions && test.questions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(test.questions.map(q => q.category))).map((category, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/recruiter/aptitude-tests/${test.id}`);
                    }}
                    className="p-2 text-primary hover:bg-primary hover:bg-opacity-10 rounded-lg transition-colors"
                    title="View Test"
                  >
                    <FaEye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(test.id, e)}
                    disabled={deletingId === test.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete Test"
                  >
                    {deletingId === test.id ? (
                      <FaSpinner className="w-5 h-5 animate-spin" />
                    ) : (
                      <FaTrash className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AptitudeTests;

