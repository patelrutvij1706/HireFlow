import React, { useState, useEffect } from 'react';
import { FaBuilding, FaChevronDown } from 'react-icons/fa';
import ProgressBar from '../ProgressBar';
import { updateCompanyInfo } from '../../../services/recruiterService';

const Step1Company = ({ userData, onNext, onBack, currentStep }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyWebsite: '',
    industryType: '',
    companySize: '',
    headquartersLocation: '',
  });
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showCompanySizeDropdown, setShowCompanySizeDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userData?.recruiterProfile) {
      setFormData({
        companyName: userData.recruiterProfile.companyName || '',
        companyWebsite: userData.recruiterProfile.companyWebsite || '',
        industryType: userData.recruiterProfile.industryType || '',
        companySize: userData.recruiterProfile.companySize || '',
        headquartersLocation: userData.recruiterProfile.headquartersLocation || '',
      });
    }
  }, [userData]);

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
    'Real Estate', 'Consulting', 'Media', 'Transportation', 'Energy', 'Other'
  ];

  const companySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIndustrySelect = (industry) => {
    setFormData(prev => ({ ...prev, industryType: industry }));
    setShowIndustryDropdown(false);
  };

  const handleCompanySizeSelect = (size) => {
    setFormData(prev => ({ ...prev, companySize: size }));
    setShowCompanySizeDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await updateCompanyInfo(formData);
      onNext();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating company information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <ProgressBar currentStep={currentStep} totalSteps={3} />

      <div className="text-center mb-6">
        <FaBuilding className="w-16 h-16 text-secondary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Tell us about your company</h2>
        <p className="text-gray-500 mt-2">Help candidates know where they'll be working</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
          <input
            type="text"
            name="companyName"
            required
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Enter company name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
          <input
            type="url"
            name="companyWebsite"
            required
            value={formData.companyWebsite}
            onChange={handleChange}
            placeholder="https://www.yourcompany.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Industry Type</label>
          <div className="relative">
            <input
              type="text"
              readOnly
              required
              value={formData.industryType}
              onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
              placeholder="Select industry"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            />
            <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
          {showIndustryDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {industries.map((industry) => (
                <button
                  key={industry}
                  type="button"
                  onClick={() => handleIndustrySelect(industry)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                >
                  {industry}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
          <div className="relative">
            <input
              type="text"
              readOnly
              required
              value={formData.companySize}
              onClick={() => setShowCompanySizeDropdown(!showCompanySizeDropdown)}
              placeholder="Select company size"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            />
            <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
          {showCompanySizeDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              {companySizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleCompanySizeSelect(size)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Headquarters Location</label>
          <input
            type="text"
            name="headquartersLocation"
            required
            value={formData.headquartersLocation}
            onChange={handleChange}
            placeholder="City, Country"
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

export default Step1Company;

