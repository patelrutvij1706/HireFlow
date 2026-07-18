import React, { useState } from 'react';
import { FaUpload } from 'react-icons/fa';
import ProgressBar from '../ProgressBar';
import { uploadResume, completeQuestionnaire } from '../../../services/candidateService';

const Step4Resume = ({ onComplete, onBack, currentStep, totalSteps = 4 }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload PDF, DOC, or DOCX file.');
      return;
    }

    if (selectedFile.size > maxSize) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please upload a resume file');
      return;
    }

    setLoading(true);
    try {
      await uploadResume(file);
      await completeQuestionnaire();
      onComplete();
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <div className="text-center mb-6">
        <FaUpload className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Upload your resume</h2>
        <p className="text-gray-500 mt-2">We'll automatically parse your details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? 'border-primary bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <FaUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Drop your resume here</p>
          <p className="text-gray-400 mb-4">or</p>
          <label className="inline-block">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileInput}
              className="hidden"
            />
            <span className="px-6 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-dark">
              Browse Files
            </span>
          </label>
          <p className="text-sm text-gray-500 mt-4">
            Supported formats: PDF, DOC, DOCX (Max 10MB)
          </p>
        </div>

        {file && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">Selected file: {file.name}</p>
          </div>
        )}

        {error && <div className="text-red-600 text-sm">{error}</div>}

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
            type="submit"
            disabled={loading || !file}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Finish'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step4Resume;

