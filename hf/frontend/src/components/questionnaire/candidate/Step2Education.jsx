import React, { useState, useEffect } from 'react';
import { FaGraduationCap } from 'react-icons/fa';
import ProgressBar from '../ProgressBar';
import { addEducation, getEducations, deleteEducation } from '../../../services/candidateService';

const Step2Education = ({ onNext, onBack, currentStep, totalSteps = 4 }) => {
  const [educations, setEducations] = useState([]);
  const [formData, setFormData] = useState({
    degree: '',
    institution: '',
    yearOfCompletion: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEducations();
  }, []);

  const loadEducations = async () => {
    try {
      const response = await getEducations();
      if (response.data && response.data.success) {
        setEducations(response.data.data.educations || []);
      } else if (response.data && response.data.data) {
        // Handle case where response structure might be different
        setEducations(response.data.data || []);
      }
    } catch (err) {
      console.error('Error loading educations:', err);
      // Don't set error state here, just log
    }
  };

  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.degree || !formData.institution || !formData.yearOfCompletion) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await addEducation(formData);
      if (response.data.success) {
        setFormData({ degree: '', institution: '', yearOfCompletion: '' });
        // Reload educations to update the list
        await loadEducations();
        setError(''); // Clear any previous errors
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding education');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEducation = async (id) => {
    try {
      await deleteEducation(id);
      await loadEducations();
    } catch (err) {
      console.error('Error deleting education:', err);
    }
  };

  const handleNext = async () => {
    setError('');
    setLoading(true);
    
    try {
      // Check if there's unsaved form data
      const hasFormData = formData.degree && formData.institution && formData.yearOfCompletion;
      
      // If there's unsaved form data, save it first
      if (hasFormData) {
        try {
          const saveResponse = await addEducation(formData);
          if (saveResponse.data && saveResponse.data.success) {
            setFormData({ degree: '', institution: '', yearOfCompletion: '' });
            // Reload educations after saving
            await loadEducations();
          } else {
            setError('Failed to save education. Please try again.');
            setLoading(false);
            return;
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Error adding education');
          setLoading(false);
          return; // Don't proceed if save failed
        }
      }
      
      // Reload educations to ensure we have the latest data
      const response = await getEducations();
      let currentEducations = [];
      
      if (response.data && response.data.success) {
        currentEducations = response.data.data.educations || [];
        setEducations(currentEducations);
      } else if (response.data && response.data.data) {
        currentEducations = response.data.data || [];
        setEducations(currentEducations);
      }
      
      if (currentEducations.length > 0) {
        setError('');
        setLoading(false);
        onNext();
      } else {
        setError('Please add at least one education');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error in handleNext:', err);
      // If API call fails, check if we have any educations in state
      if (educations.length > 0) {
        setError('');
        setLoading(false);
        onNext();
      } else {
        setError('Please add at least one education');
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <div className="text-center mb-6">
        <FaGraduationCap className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Add your education.</h2>
        <p className="text-gray-500 mt-2">Tell us about your educational background</p>
      </div>

      <form onSubmit={handleAddEducation} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
          <input
            type="text"
            name="degree"
            required
            value={formData.degree}
            onChange={handleChange}
            placeholder="B.Tech / MBA / etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
          <input
            type="text"
            name="institution"
            required
            value={formData.institution}
            onChange={handleChange}
            placeholder="Enter institution name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Year of Completion</label>
          <select
            name="yearOfCompletion"
            required
            value={formData.yearOfCompletion}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select year</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-primary hover:bg-gray-50 disabled:opacity-50"
        >
          + Add Another Education
        </button>
      </form>

      {/* Display Added Educations */}
      {educations.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="font-medium text-gray-700">Added Educations:</h3>
          {educations.map((edu) => (
            <div key={edu.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{edu.degree}</p>
                <p className="text-sm text-gray-600">{edu.institution} - {edu.yearOfCompletion}</p>
              </div>
              <button
                onClick={() => handleDeleteEducation(edu.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center pt-6 mt-6 border-t">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <div className="text-center">
          <button
            type="button"
            className="text-sm text-gray-500 hover:underline"
          >
            Save & Continue Later
          </button>
        </div>
        <button
          type="button"
          onClick={handleNext}
          disabled={loading}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Step2Education;

