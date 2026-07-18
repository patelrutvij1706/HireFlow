import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaBuilding, FaChevronDown } from 'react-icons/fa';
import { signup } from '../../services/authService';

const RecruiterSignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    companySize: '',
    workEmail: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCompanySizeDropdown, setShowCompanySizeDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const companySizes = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+',
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCompanySizeSelect = (size) => {
    setFormData(prev => ({ ...prev, companySize: size }));
    setShowCompanySizeDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to Terms of Use and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      const response = await signup({
        workEmail: formData.workEmail,
        password: formData.password,
        role: 'recruiter',
        fullName: formData.fullName,
        companyName: formData.companyName,
        companySize: formData.companySize,
      });

      if (response.success) {
        navigate('/questionnaire/recruiter');
      } else {
        setError(response.message || 'Sign up failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Role Selection Tabs */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        <Link
          to="/signup/candidate"
          className="flex items-center gap-2 px-6 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50"
        >
          <FaUser className="w-4 h-4" />
          <span>Candidate</span>
        </Link>
        <Link
          to="/signup/recruiter"
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg shadow-md"
        >
          <FaBuilding className="w-4 h-4" />
          <span>Recruiter</span>
        </Link>
      </div>

      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 mt-16">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <FaBuilding className="w-16 h-16 text-secondary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Create Recruiter Account</h2>
          <p className="text-gray-500 mt-2">Find the best talent for your company</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Company Name */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter your company name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Company Size */}
          <div className="relative">
            <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-2">
              Company Size
            </label>
            <div className="relative">
              <input
                id="companySize"
                name="companySize"
                type="text"
                readOnly
                required
                value={formData.companySize}
                onClick={() => setShowCompanySizeDropdown(!showCompanySizeDropdown)}
                placeholder="Select company size"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
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

          {/* Work Email */}
          <div>
            <label htmlFor="workEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Work Email
            </label>
            <input
              id="workEmail"
              name="workEmail"
              type="email"
              required
              value={formData.workEmail}
              onChange={handleChange}
              placeholder="Enter your work email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
              I agree to{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms of Use</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign up with</span>
            </div>
          </div>

          {/* Social Sign Up Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-400 cursor-not-allowed opacity-60"
            >
              <span className="text-xl font-bold mr-2">G</span>
              Google
            </button>
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-400 cursor-not-allowed opacity-60"
            >
              <span className="text-blue-400 font-bold mr-2">in</span>
              LinkedIn
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/signin" className="text-primary hover:underline font-medium">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruiterSignUp;

