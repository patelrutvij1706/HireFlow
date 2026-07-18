import React, { useState, useEffect } from 'react';
import { FaBriefcase } from 'react-icons/fa';
import ProgressBar from '../ProgressBar';
import { addExperience, getExperiences, deleteExperience, addSkill, getSkills, deleteSkill } from '../../../services/candidateService';

const Step3Experience = ({ userData, onNext, onBack, currentStep, totalSteps = 4 }) => {
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    fromDate: '',
    toDate: '',
    isCurrent: false,
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFresher, setIsFresher] = useState(false);

  useEffect(() => {
    loadExperiences();
    loadSkills();
    // Check if candidate is a fresher
    if (userData?.candidateProfile?.isFresher) {
      setIsFresher(true);
    }
  }, [userData]);

  const loadExperiences = async () => {
    try {
      const response = await getExperiences();
      if (response.data.success) {
        setExperiences(response.data.data.experiences || []);
      }
    } catch (err) {
      console.error('Error loading experiences:', err);
    }
  };

  const loadSkills = async () => {
    try {
      const response = await getSkills();
      if (response.data.success) {
        setSkills(response.data.data.skills || []);
      }
    } catch (err) {
      console.error('Error loading skills:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    setError('');

    // Only validate if not a fresher, or if fresher has filled some fields
    if (!isFresher && (!formData.companyName || !formData.role || !formData.fromDate)) {
      setError('Please fill in all required fields');
      return;
    }

    // If fresher and fields are empty, don't add experience
    if (isFresher && (!formData.companyName && !formData.role && !formData.fromDate)) {
      return;
    }

    // If fresher has partially filled fields, validate them
    if (isFresher && (formData.companyName || formData.role || formData.fromDate)) {
      if (!formData.companyName || !formData.role || !formData.fromDate) {
        setError('Please fill in all fields if adding an experience');
        return;
      }
    }

    setLoading(true);
    try {
      await addExperience({
        ...formData,
        toDate: formData.isCurrent ? null : formData.toDate,
      });
      setFormData({
        companyName: '',
        role: '',
        fromDate: '',
        toDate: '',
        isCurrent: false,
      });
      loadExperiences();
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding experience');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExperience = async (id) => {
    try {
      await deleteExperience(id);
      loadExperiences();
    } catch (err) {
      console.error('Error deleting experience:', err);
    }
  };

  const handleSkillInputKeyPress = async (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      try {
        await addSkill({ name: skillInput.trim() });
        setSkillInput('');
        loadSkills();
      } catch (err) {
        console.error('Error adding skill:', err);
      }
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await deleteSkill(id);
      loadSkills();
    } catch (err) {
      console.error('Error deleting skill:', err);
    }
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <div className="text-center mb-6">
        <FaBriefcase className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Tell us about your experience</h2>
        <p className="text-gray-500 mt-2">Share your professional background</p>
      </div>

      {isFresher && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>You've indicated that you're a fresher.</strong> If you have any internships, projects, or freelance work, you can add them below. Otherwise, you can skip adding experience and proceed to the next step.
          </p>
        </div>
      )}

      <form onSubmit={handleAddExperience} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name {!isFresher && <span className="text-red-500">*</span>}</label>
          <input
            type="text"
            name="companyName"
            required={!isFresher}
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Enter company or project name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role/Position {!isFresher && <span className="text-red-500">*</span>}</label>
          <input
            type="text"
            name="role"
            required={!isFresher}
            value={formData.role}
            onChange={handleChange}
            placeholder="Enter role or project type"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date {!isFresher && <span className="text-red-500">*</span>}</label>
            <input
              type="date"
              name="fromDate"
              required={!isFresher}
              value={formData.fromDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              name="toDate"
              disabled={formData.isCurrent}
              value={formData.toDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
            />
            <div className="mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isCurrent"
                  checked={formData.isCurrent}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Current position</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={handleSkillInputKeyPress}
            placeholder="Type skill and press Enter"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  + {skill.name}
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="ml-2 text-gray-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-primary hover:bg-gray-50 disabled:opacity-50"
        >
          + Add Another Experience
        </button>
      </form>

      {/* Display Added Experiences */}
      {experiences.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="font-medium text-gray-700">Added Experiences:</h3>
          {experiences.map((exp) => (
            <div key={exp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{exp.role}</p>
                <p className="text-sm text-gray-600">{exp.companyName} - {exp.fromDate} to {exp.toDate || 'Present'}</p>
              </div>
              <button
                onClick={() => handleDeleteExperience(exp.id)}
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
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step3Experience;

