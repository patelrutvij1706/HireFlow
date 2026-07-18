import React, { useState } from 'react';
import { FaShieldAlt, FaUpload, FaImage } from 'react-icons/fa';
import ProgressBar from '../ProgressBar';
import { uploadCompanyDocuments, completeQuestionnaire } from '../../../services/recruiterService';

const Step4CompanyDetails = ({ onComplete, onBack, currentStep }) => {
  const [companyLogo, setCompanyLogo] = useState(null);
  const [businessProof, setBusinessProof] = useState(null);
  const [domainEmail, setDomainEmail] = useState('');
  const [dragActiveLogo, setDragActiveLogo] = useState(false);
  const [dragActiveProof, setDragActiveProof] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogoDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActiveLogo(true);
    } else if (e.type === 'dragleave') {
      setDragActiveLogo(false);
    }
  };

  const handleLogoDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveLogo(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoFile(e.dataTransfer.files[0]);
    }
  };

  const handleLogoInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleLogoFile(e.target.files[0]);
    }
  };

  const handleLogoFile = (file) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PNG or JPG file.');
      return;
    }

    if (file.size > maxSize) {
      setError('File size exceeds 5MB limit.');
      return;
    }

    setCompanyLogo(file);
    setError('');
  };

  const handleProofDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActiveProof(true);
    } else if (e.type === 'dragleave') {
      setDragActiveProof(false);
    }
  };

  const handleProofDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveProof(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProofFile(e.dataTransfer.files[0]);
    }
  };

  const handleProofInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleProofFile(e.target.files[0]);
    }
  };

  const handleProofFile = (file) => {
    const allowedTypes = ['application/pdf', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PDF, PNG, or DOC file.');
      return;
    }

    if (file.size > maxSize) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setBusinessProof(file);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!companyLogo || !businessProof || !domainEmail) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await uploadCompanyDocuments(
        { companyLogo, businessProof },
        domainEmail
      );
      await completeQuestionnaire();
      onComplete();
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading company documents');
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
            <FaShieldAlt className="w-16 h-16 text-secondary" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Upload your company details</h2>
        <p className="text-gray-500 mt-2">Help us verify your organization for authenticity</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              dragActiveLogo ? 'border-secondary bg-purple-50' : 'border-gray-300'
            }`}
            onDragEnter={handleLogoDrag}
            onDragLeave={handleLogoDrag}
            onDragOver={handleLogoDrag}
            onDrop={handleLogoDrop}
          >
            <FaImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Click to upload company logo</p>
            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
            <label className="inline-block mt-2">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleLogoInput}
                className="hidden"
              />
              <span className="px-4 py-2 bg-secondary text-white rounded-lg cursor-pointer hover:bg-secondary-dark text-sm">
                Browse Files
              </span>
            </label>
          </div>
          {companyLogo && (
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <p className="text-sm text-gray-700">Selected: {companyLogo.name}</p>
            </div>
          )}
        </div>

        {/* Business Proof Document */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Proof Document</label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              dragActiveProof ? 'border-secondary bg-purple-50' : 'border-gray-300'
            }`}
            onDragEnter={handleProofDrag}
            onDragLeave={handleProofDrag}
            onDragOver={handleProofDrag}
            onDrop={handleProofDrop}
          >
            <FaUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Click to upload business registration</p>
            <p className="text-xs text-gray-500 mb-2">PDF, PNG, DOC up to 10MB</p>
            <p className="text-xs text-gray-400 mb-2">
              Upload business registration, tax certificate, or incorporation document
            </p>
            <label className="inline-block mt-2">
              <input
                type="file"
                accept=".pdf,.png,.doc,.docx"
                onChange={handleProofInput}
                className="hidden"
              />
              <span className="px-4 py-2 bg-secondary text-white rounded-lg cursor-pointer hover:bg-secondary-dark text-sm">
                Browse Files
              </span>
            </label>
          </div>
          {businessProof && (
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <p className="text-sm text-gray-700">Selected: {businessProof.name}</p>
            </div>
          )}
        </div>

        {/* Domain Email Verification */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Domain Email Verification</label>
          <input
            type="email"
            required
            value={domainEmail}
            onChange={(e) => setDomainEmail(e.target.value)}
            placeholder="admin@yourcompany.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-sm text-gray-500 mt-1">
            We'll send a verification link to confirm domain ownership
          </p>
        </div>

        {/* Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Note:</span> Your account will be under review for 24-48 hours. You'll receive an email once verified.
          </p>
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
            disabled={loading || !companyLogo || !businessProof || !domainEmail}
            className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Finish'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step4CompanyDetails;

