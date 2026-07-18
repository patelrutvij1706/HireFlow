import React, { useState, useEffect } from 'react';
import { FaUser, FaSave, FaSpinner, FaCheckCircle, FaTimesCircle, FaUpload, FaFilePdf, FaGraduationCap, FaBriefcase, FaPlus, FaTrash } from 'react-icons/fa';
import { getCurrentUser } from '../../services/authService';
import { 
  updateCandidateProfile, 
  uploadResume,
  addEducation,
  getEducations,
  deleteEducation,
  addExperience,
  getExperiences,
  deleteExperience,
  addSkill,
  getSkills,
  deleteSkill
} from '../../services/candidateService';
import { getFileUrl } from '../../utils/api';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    location: '',
    isFresher: false,
  });
  const [educations, setEducations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [educationForm, setEducationForm] = useState({
    degree: '',
    institution: '',
    yearOfCompletion: '',
  });
  const [experienceForm, setExperienceForm] = useState({
    companyName: '',
    role: '',
    fromDate: '',
    toDate: '',
    isCurrent: false,
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');

  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    loadProfile();
    loadEducations();
    loadExperiences();
    loadSkills();
  }, []);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await getCurrentUser();
      if (response.success && response.data.user) {
        const user = response.data.user;
        setUserData(user);
        setFormData({
          fullName: user.candidateProfile?.fullName || '',
          contactNumber: user.candidateProfile?.contactNumber || '',
          location: user.candidateProfile?.location || '',
          isFresher: user.candidateProfile?.isFresher || false,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadEducations = async () => {
    try {
      const response = await getEducations();
      if (response.data && response.data.success) {
        setEducations(response.data.data.educations || []);
      }
    } catch (err) {
      console.error('Error loading educations:', err);
    }
  };

  const loadExperiences = async () => {
    try {
      const response = await getExperiences();
      if (response.data && response.data.success) {
        setExperiences(response.data.data.experiences || []);
      }
    } catch (err) {
      console.error('Error loading experiences:', err);
    }
  };

  const loadSkills = async () => {
    try {
      const response = await getSkills();
      if (response.data && response.data.success) {
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
    setError('');
    setSuccess('');
  };

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setEducationForm(prev => ({ ...prev, [name]: value }));
  };

  const handleExperienceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExperienceForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }
      setResumeFile(file);
      setError('');
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setError('Please select a resume file');
      return;
    }

    try {
      setUploadingResume(true);
      setError('');
      const response = await uploadResume(resumeFile);
      if (response.data.success) {
        setSuccess('Resume uploaded successfully');
        setResumeFile(null);
        await loadProfile();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await updateCandidateProfile(formData);
      if (response.data.success) {
        setSuccess('Profile updated successfully');
        await loadProfile();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    if (!educationForm.degree || !educationForm.institution || !educationForm.yearOfCompletion) {
      setError('Please fill in all education fields');
      return;
    }

    try {
      const response = await addEducation(educationForm);
      if (response.data.success) {
        setSuccess('Education added successfully');
        setEducationForm({ degree: '', institution: '', yearOfCompletion: '' });
        await loadEducations();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding education');
    }
  };

  const handleDeleteEducation = async (id) => {
    try {
      await deleteEducation(id);
      setSuccess('Education deleted successfully');
      await loadEducations();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting education');
    }
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (!experienceForm.companyName || !experienceForm.role || !experienceForm.fromDate) {
      setError('Please fill in all required experience fields');
      return;
    }

    try {
      const response = await addExperience({
        ...experienceForm,
        toDate: experienceForm.isCurrent ? null : experienceForm.toDate,
      });
      if (response.data.success) {
        setSuccess('Experience added successfully');
        setExperienceForm({
          companyName: '',
          role: '',
          fromDate: '',
          toDate: '',
          isCurrent: false,
        });
        await loadExperiences();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding experience');
    }
  };

  const handleDeleteExperience = async (id) => {
    try {
      await deleteExperience(id);
      setSuccess('Experience deleted successfully');
      await loadExperiences();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting experience');
    }
  };

  const handleAddSkill = async (e) => {
    if (e) e.preventDefault();
    if (!skillInput.trim()) {
      setError('Please enter a skill');
      return;
    }

    try {
      const response = await addSkill({ name: skillInput.trim() });
      if (response.data.success) {
        setSuccess('Skill added successfully');
        setSkillInput('');
        await loadSkills();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding skill');
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await deleteSkill(id);
      setSuccess('Skill deleted successfully');
      await loadSkills();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting skill');
    }
  };

  if (loadingProfile) {
    return (
      <div className="p-6 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Profile</h1>
          <p className="text-gray-600">Update your personal information and profile details</p>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
            <FaTimesCircle />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
            <FaCheckCircle />
            <span>{success}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveSection('personal')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === 'personal'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaUser className="inline-block mr-2" />
                Personal Information
              </button>
              <button
                onClick={() => setActiveSection('education')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === 'education'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaGraduationCap className="inline-block mr-2" />
                Education
              </button>
              {!formData.isFresher && (
                <button
                  onClick={() => setActiveSection('experience')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeSection === 'experience'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaBriefcase className="inline-block mr-2" />
                  Experience
                </button>
              )}
              <button
                onClick={() => setActiveSection('skills')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === 'skills'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Skills
              </button>
              <button
                onClick={() => setActiveSection('resume')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === 'resume'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaFilePdf className="inline-block mr-2" />
                Resume
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Personal Information Tab */}
            {activeSection === 'personal' && (
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
                    value={userData?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
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

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaSave />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Education Tab */}
            {activeSection === 'education' && (
              <div className="space-y-4">
                <form onSubmit={handleAddEducation} className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Education</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                    <input
                      type="text"
                      name="degree"
                      required
                      value={educationForm.degree}
                      onChange={handleEducationChange}
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
                      value={educationForm.institution}
                      onChange={handleEducationChange}
                      placeholder="Enter institution name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year of Completion</label>
                    <select
                      name="yearOfCompletion"
                      required
                      value={educationForm.yearOfCompletion}
                      onChange={handleEducationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaPlus />
                    <span>Add Education</span>
                  </button>
                </form>

                {/* Education List */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Education</h3>
                  {educations.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No education added yet</p>
                  ) : (
                    <div className="space-y-3">
                      {educations.map((edu) => (
                        <div key={edu.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{edu.degree}</p>
                            <p className="text-sm text-gray-600">{edu.institution}</p>
                            <p className="text-sm text-gray-500">{edu.yearOfCompletion}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteEducation(edu.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Experience Tab */}
            {activeSection === 'experience' && !formData.isFresher && (
              <div className="space-y-4">
                <form onSubmit={handleAddExperience} className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Experience</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      required
                      value={experienceForm.companyName}
                      onChange={handleExperienceChange}
                      placeholder="Enter company name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role/Position</label>
                    <input
                      type="text"
                      name="role"
                      required
                      value={experienceForm.role}
                      onChange={handleExperienceChange}
                      placeholder="Enter role"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                      <input
                        type="date"
                        name="fromDate"
                        required
                        value={experienceForm.fromDate}
                        onChange={handleExperienceChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                      <input
                        type="date"
                        name="toDate"
                        disabled={experienceForm.isCurrent}
                        value={experienceForm.toDate}
                        onChange={handleExperienceChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                      />
                      <div className="mt-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="isCurrent"
                            checked={experienceForm.isCurrent}
                            onChange={handleExperienceChange}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600">Current position</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaPlus />
                    <span>Add Experience</span>
                  </button>
                </form>

                {/* Experience List */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Experience</h3>
                  {experiences.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No experience added yet</p>
                  ) : (
                    <div className="space-y-3">
                      {experiences.map((exp) => (
                        <div key={exp.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{exp.role}</p>
                            <p className="text-sm text-gray-600">{exp.companyName}</p>
                            <p className="text-sm text-gray-500">
                              {exp.fromDate} to {exp.toDate || 'Present'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteExperience(exp.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {activeSection === 'skills' && (
              <div className="space-y-4">
                <form onSubmit={handleAddSkill} className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Skill</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        placeholder="Type skill and press Enter"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
                      >
                        <FaPlus />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Skills List */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Skills</h3>
                  {skills.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No skills added yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-full text-sm"
                        >
                          {skill.name}
                          <button
                            onClick={() => handleDeleteSkill(skill.id)}
                            className="ml-2 hover:text-red-200 transition-colors"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resume Tab */}
            {activeSection === 'resume' && (
              <div className="space-y-4">
                {userData?.candidateProfile?.resumeUrl && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Current Resume:</p>
                    <a
                      href={getFileUrl(userData.candidateProfile.resumeUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center space-x-2"
                    >
                      <FaFilePdf />
                      <span>View Current Resume</span>
                    </a>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Resume</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-sm text-gray-500 mt-2">Supported formats: PDF, DOC, DOCX (Max 10MB)</p>
                  {resumeFile && (
                    <p className="text-sm text-gray-600 mt-2">Selected: {resumeFile.name}</p>
                  )}
                </div>

                <button
                  onClick={handleResumeUpload}
                  disabled={!resumeFile || uploadingResume}
                  className="w-full px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {uploadingResume ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FaUpload />
                      <span>Upload Resume</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
