import React, { useState, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';
import ProgressBar from '../ProgressBar';
import { updateCandidateProfile } from '../../../services/candidateService';

const Step1About = ({ userData, onNext, onBack, currentStep, totalSteps = 4 }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    location: '',
    isFresher: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.candidateProfile?.fullName || '',
        email: userData.email || '',
        contactNumber: userData.candidateProfile?.contactNumber || '',
        location: userData.candidateProfile?.location || '',
        isFresher: userData.candidateProfile?.isFresher || false,
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await updateCandidateProfile(formData);
      onNext();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <div className="text-center mb-6">
        <FaUser className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Tell us about yourself</h2>
        <p className="text-gray-500 mt-2">Help us get to know you better</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="user@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-sm text-gray-500 mt-1">This email is linked to your account</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
          <input
            type="tel"
            name="contactNumber"
            required
            value={formData.contactNumber}
            onChange={handleChange}
            placeholder="Enter phone number"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            name="location"
            required
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter city, country"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="isFresher"
              checked={formData.isFresher}
              onChange={handleChange}
              className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">I am a fresher (no work experience)</span>
              <p className="text-xs text-gray-500 mt-1">Check this if you don't have any professional work experience</p>
            </div>
          </label>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="flex justify-between items-center pt-4">
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
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step1About;

