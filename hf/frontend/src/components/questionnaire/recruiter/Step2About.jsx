import React, { useState, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';
import ProgressBar from '../ProgressBar';
import { updateRecruiterProfile } from '../../../services/recruiterService';

const Step2About = ({ userData, onNext, onBack, currentStep }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    role: '',
    contactNumber: '',
    linkedinProfile: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.recruiterProfile?.fullName || '',
        workEmail: userData.email || '',
        role: userData.recruiterProfile?.role || '',
        contactNumber: userData.recruiterProfile?.contactNumber || '',
        linkedinProfile: userData.recruiterProfile?.linkedinProfile || '',
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await updateRecruiterProfile(formData);
      onNext();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <ProgressBar currentStep={currentStep} totalSteps={3} />

      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <FaUser className="w-16 h-16 text-secondary" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full"></div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Tell us about yourself</h2>
        <p className="text-gray-500 mt-2">We'll use this info to personalize your hiring experience</p>
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
            placeholder="Enter your full name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Work Email</label>
          <input
            type="email"
            name="workEmail"
            required
            value={formData.workEmail}
            onChange={handleChange}
            placeholder="recruiter@company.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-sm text-gray-500 mt-1">This email is linked to your account</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role / Designation</label>
          <input
            type="text"
            name="role"
            required
            value={formData.role}
            onChange={handleChange}
            placeholder="e.g., HR Manager, Hiring Lead"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn Profile <span className="text-gray-500 font-normal">(Optional)</span>
          </label>
          <input
            type="url"
            name="linkedinProfile"
            value={formData.linkedinProfile}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/yourprofile"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
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
            className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2About;

