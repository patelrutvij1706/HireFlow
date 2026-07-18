import React, { useState } from 'react';
import { FaFileUpload, FaSpinner, FaCheckCircle, FaTimesCircle, FaFilePdf } from 'react-icons/fa';
import { parseResume } from '../../services/candidateService';

const ResumeParser = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleParse = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const response = await parseResume(file);
      
      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError(response.data.message || 'Failed to parse resume');
      }
    } catch (err) {
      console.error('Error parsing resume:', err);
      
      // Handle specific error messages
      let errorMessage = 'Failed to parse resume. Please try again.';
      
      if (err.response?.data?.error) {
        const apiError = err.response.data.error;
        
        // Check for model overload error
        if (typeof apiError === 'string' && apiError.toLowerCase().includes('overloaded')) {
          errorMessage = 'The AI model is currently overloaded. Please wait a moment and try again.';
        } else if (typeof apiError === 'string' && apiError.toLowerCase().includes('quota')) {
          errorMessage = 'API quota exceeded. Please try again later.';
        } else if (typeof apiError === 'object' && apiError.message) {
          errorMessage = apiError.message;
        } else if (typeof apiError === 'string') {
          errorMessage = apiError;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Log detailed error for debugging
      if (err.response?.data?.details) {
        console.error('Detailed error:', err.response.data.details);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

  // Helper function to safely render a value (handles strings, objects, arrays)
  const renderValue = (value) => {
    if (value === null || value === undefined) return null;
    
    // If it's an object, convert it to a readable string
    if (typeof value === 'object' && !Array.isArray(value)) {
      return Object.entries(value)
        .map(([key, val]) => `${key}: ${val}`)
        .join(', ');
    }
    
    // If it's an array, join the elements
    if (Array.isArray(value)) {
      return value.map((item, idx) => (
        <div key={idx} className="mb-2">
          {typeof item === 'object' ? renderValue(item) : String(item)}
        </div>
      ));
    }
    
    return String(value);
  };

  // Helper function to format education/experience items
  const formatItem = (item) => {
    if (item === null || item === undefined) return '';
    if (typeof item === 'string') return item;
    if (typeof item === 'number') return String(item);
    if (typeof item === 'object') {
      // Handle objects like {Degree: "...", University: "..."} or {Role: "...", Company: "..."}
      const parts = [];
      
      // Education fields
      if (item.Degree || item.degree) parts.push(item.Degree || item.degree);
      if (item.University || item.university || item.Institution || item.institution) {
        const institution = item.University || item.university || item.Institution || item.institution;
        parts.push(`at ${institution}`);
      }
      if (item.Year || item.year || item.YearOfCompletion || item.yearOfCompletion) {
        const year = item.Year || item.year || item.YearOfCompletion || item.yearOfCompletion;
        parts.push(`(${year})`);
      }
      
      // Work experience fields
      if (item.Role || item.role || item.Position || item.position || item.JobTitle || item.jobTitle) {
        const role = item.Role || item.role || item.Position || item.position || item.JobTitle || item.jobTitle;
        parts.push(role);
      }
      if (item.Company || item.company || item.Employer || item.employer) {
        const company = item.Company || item.company || item.Employer || item.employer;
        parts.push(`at ${company}`);
      }
      if (item.Duration || item.duration || item.Period || item.period) {
        const duration = item.Duration || item.duration || item.Period || item.period;
        parts.push(`(${duration})`);
      }
      if (item.Description || item.description) {
        parts.push(`- ${item.Description || item.description}`);
      }
      
      // If no specific fields found, try to format all key-value pairs
      if (parts.length === 0) {
        const entries = Object.entries(item)
          .filter(([key, value]) => value !== null && value !== undefined && value !== '')
          .map(([key, value]) => `${key}: ${value}`);
        if (entries.length > 0) {
          return entries.join(', ');
        }
      }
      
      return parts.length > 0 ? parts.join(' ') : JSON.stringify(item);
    }
    return String(item);
  };

  const renderParsedData = () => {
    if (!result || !result.parsedData) return null;

    const data = result.parsedData;
    
    // If parsedData has rawResponse, display it
    if (data.rawResponse && !data.FullName && !data.fullName) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Parsed Resume Data</h3>
          <div className="bg-gray-50 p-4 rounded-xl">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">{data.rawResponse}</pre>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Parsed Resume Data</h3>
          <FaCheckCircle className="text-green-500 text-2xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">Personal Information</h4>
            {(data.FullName || data.fullName) && (
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-gray-800 font-medium">{data.FullName || data.fullName}</p>
              </div>
            )}
            {(data.Email || data.email) && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-800 font-medium">{data.Email || data.email}</p>
              </div>
            )}
            {(data.Phone || data.phone) && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-800 font-medium">{data.Phone || data.phone}</p>
              </div>
            )}
            {(data.Location || data.location) && (
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-gray-800 font-medium">{data.Location || data.location}</p>
              </div>
            )}
            {(data['Years of Experience'] || data.yearsOfExperience || data.experience) && (
              <div>
                <p className="text-sm text-gray-500">Years of Experience</p>
                <p className="text-gray-800 font-medium">
                  {data['Years of Experience'] || data.yearsOfExperience || data.experience}
                </p>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">Skills</h4>
            {(data.Skills || data.skills) && (
              <div>
                {Array.isArray(data.Skills || data.skills) ? (
                  <div className="flex flex-wrap gap-2">
                    {(data.Skills || data.skills).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-sm"
                      >
                        {typeof skill === 'object' ? JSON.stringify(skill) : String(skill)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-800">{typeof (data.Skills || data.skills) === 'object' ? JSON.stringify(data.Skills || data.skills) : String(data.Skills || data.skills)}</p>
                )}
              </div>
            )}
          </div>

          {/* Education */}
          {(data.Education || data.education) && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">Education</h4>
              <div className="text-gray-800">
                {Array.isArray(data.Education || data.education) ? (
                  <ul className="list-disc list-inside space-y-2">
                    {(data.Education || data.education).map((edu, index) => (
                      <li key={index}>{formatItem(edu)}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{formatItem(data.Education || data.education)}</p>
                )}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {(data['Work Experience'] || data.workExperience) && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">Work Experience</h4>
              <div className="text-gray-800">
                {Array.isArray(data['Work Experience'] || data.workExperience) ? (
                  <ul className="list-disc list-inside space-y-2">
                    {(data['Work Experience'] || data.workExperience).map((exp, index) => (
                      <li key={index}>{formatItem(exp)}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{formatItem(data['Work Experience'] || data.workExperience)}</p>
                )}
              </div>
            </div>
          )}

          {/* Certifications */}
          {(data.Certifications || data.certifications) && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">Certifications</h4>
              <div className="text-gray-800">
                {Array.isArray(data.Certifications || data.certifications) ? (
                  <ul className="list-disc list-inside space-y-2">
                    {(data.Certifications || data.certifications).map((cert, index) => (
                      <li key={index}>{formatItem(cert)}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{formatItem(data.Certifications || data.certifications)}</p>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          {(data.Summary || data.summary) && (
            <div className="space-y-4 md:col-span-2">
              <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">Summary</h4>
              <p className="text-gray-800">{data.Summary || data.summary}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Resume Parser</h1>
          <p className="text-gray-600">
            Upload your resume PDF to automatically extract and parse your information using AI
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Resume (PDF only)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary transition-colors">
              <div className="space-y-1 text-center">
                {file ? (
                  <div className="flex items-center justify-center space-x-2 text-primary">
                    <FaFilePdf className="text-3xl" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <FaFileUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".pdf"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
              <FaTimesCircle />
              <span>{error}</span>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={handleParse}
              disabled={loading || !file}
              className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Parsing Resume...</span>
                </>
              ) : (
                <>
                  <FaFileUpload />
                  <span>Parse Resume</span>
                </>
              )}
            </button>
            {file && (
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        {renderParsedData()}
      </div>
    </div>
  );
};

export default ResumeParser;

