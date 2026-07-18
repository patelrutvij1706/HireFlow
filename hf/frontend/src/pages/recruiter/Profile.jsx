import React, { useState, useEffect } from 'react';
import { FaUser, FaBuilding, FaSave, FaSpinner, FaCheckCircle, FaTimesCircle, FaChevronDown, FaBriefcase, FaPlus, FaTrash, FaUpload, FaImage, FaFile, FaShieldAlt } from 'react-icons/fa';
import { getCurrentUser } from '../../services/authService';
import { 
  updateRecruiterProfile, 
  updateCompanyInfo,
  addExperience,
  getExperiences,
  deleteExperience,
  addSkill,
  getSkills,
  deleteSkill,
  uploadCompanyDocuments
} from '../../services/recruiterService';
import { getFileUrl } from '../../utils/api';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [personalFormData, setPersonalFormData] = useState({
    fullName: '',
    role: '',
    contactNumber: '',
    linkedinProfile: '',
  });
  const [companyFormData, setCompanyFormData] = useState({
    companyName: '',
    companyWebsite: '',
    industryType: '',
    companySize: '',
    headquartersLocation: '',
  });
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experienceForm, setExperienceForm] = useState({
    companyName: '',
    role: '',
    fromDate: '',
    toDate: '',
    isCurrent: false,
  });
  const [skillInput, setSkillInput] = useState('');
  const [companyLogo, setCompanyLogo] = useState(null);
  const [businessProof, setBusinessProof] = useState(null);
  const [domainEmail, setDomainEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showCompanySizeDropdown, setShowCompanySizeDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'company', 'experience', 'skills', 'documents'

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
    'Real Estate', 'Consulting', 'Media', 'Transportation', 'Energy', 'Other'
  ];

  const companySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

  useEffect(() => {
    loadProfile();
    loadExperiences();
    loadSkills();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showIndustryDropdown && !event.target.closest('.industry-dropdown')) {
        setShowIndustryDropdown(false);
      }
      if (showCompanySizeDropdown && !event.target.closest('.company-size-dropdown')) {
        setShowCompanySizeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIndustryDropdown, showCompanySizeDropdown]);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await getCurrentUser();
      if (response.success && response.data.user) {
        const user = response.data.user;
        setUserData(user);
        setPersonalFormData({
          fullName: user.recruiterProfile?.fullName || '',
          role: user.recruiterProfile?.role || '',
          contactNumber: user.recruiterProfile?.contactNumber || '',
          linkedinProfile: user.recruiterProfile?.linkedinProfile || '',
        });
        setCompanyFormData({
          companyName: user.recruiterProfile?.companyName || '',
          companyWebsite: user.recruiterProfile?.companyWebsite || '',
          industryType: user.recruiterProfile?.industryType || '',
          companySize: user.recruiterProfile?.companySize || '',
          headquartersLocation: user.recruiterProfile?.headquartersLocation || '',
        });
        setDomainEmail(user.recruiterProfile?.domainEmail || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoadingProfile(false);
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

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleExperienceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExperienceForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleIndustrySelect = (industry) => {
    setCompanyFormData(prev => ({ ...prev, industryType: industry }));
    setShowIndustryDropdown(false);
  };

  const handleCompanySizeSelect = (size) => {
    setCompanyFormData(prev => ({ ...prev, companySize: size }));
    setShowCompanySizeDropdown(false);
  };

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await updateRecruiterProfile(personalFormData);
      if (response.data.success) {
        setSuccess('Personal information updated successfully');
        await loadProfile();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating personal information');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await updateCompanyInfo(companyFormData);
      if (response.data.success) {
        setSuccess('Company information updated successfully');
        await loadProfile();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating company information');
    } finally {
      setLoading(false);
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

  const handleDocumentsUpload = async (e) => {
    e.preventDefault();
    // Allow updating if at least one field is provided
    if (!companyLogo && !businessProof && !domainEmail) {
      setError('Please provide at least one field to update');
      return;
    }

    setLoading(true);
    try {
      const files = {};
      if (companyLogo) files.companyLogo = companyLogo;
      if (businessProof) files.businessProof = businessProof;
      
      const response = await uploadCompanyDocuments(
        files,
        domainEmail || userData?.recruiterProfile?.domainEmail || ''
      );
      if (response.data.success) {
        setSuccess('Company documents updated successfully');
        if (companyLogo) setCompanyLogo(null);
        if (businessProof) setBusinessProof(null);
        await loadProfile();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading company documents');
    } finally {
      setLoading(false);
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
          <p className="text-gray-600">Update your personal and company information</p>
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

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'personal'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaUser className="inline-block mr-2" />
                Personal
              </button>
              <button
                onClick={() => setActiveTab('company')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'company'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaBuilding className="inline-block mr-2" />
                Company
              </button>
              <button
                onClick={() => setActiveTab('experience')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'experience'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaBriefcase className="inline-block mr-2" />
                Experience
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'skills'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Skills
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'documents'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaShieldAlt className="inline-block mr-2" />
                Documents
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <form onSubmit={handlePersonalSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={personalFormData.fullName}
                    onChange={handlePersonalChange}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <input
                    type="text"
                    name="role"
                    value={personalFormData.role}
                    onChange={handlePersonalChange}
                    placeholder="e.g., HR Manager, Talent Acquisition"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    required
                    value={personalFormData.contactNumber}
                    onChange={handlePersonalChange}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
                  <input
                    type="url"
                    name="linkedinProfile"
                    value={personalFormData.linkedinProfile}
                    onChange={handlePersonalChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
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

            {/* Company Information Tab */}
            {activeTab === 'company' && (
              <form onSubmit={handleCompanySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={companyFormData.companyName}
                    onChange={handleCompanyChange}
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
                    value={companyFormData.companyWebsite}
                    onChange={handleCompanyChange}
                    placeholder="https://www.yourcompany.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="relative industry-dropdown">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry Type</label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      required
                      value={companyFormData.industryType}
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

                <div className="relative company-size-dropdown">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      required
                      value={companyFormData.companySize}
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
                    value={companyFormData.headquartersLocation}
                    onChange={handleCompanyChange}
                    placeholder="City, Country"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
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

            {/* Experience Tab */}
            {activeTab === 'experience' && (
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
            {activeTab === 'skills' && (
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

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                {/* Company Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                  {userData?.recruiterProfile?.companyLogoUrl && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                      <img
                        src={getFileUrl(userData.recruiterProfile.companyLogoUrl)}
                        alt="Company Logo"
                        className="h-20 w-auto object-contain"
                      />
                    </div>
                  )}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FaImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload company logo</p>
                    <p className="text-xs text-gray-500 mb-4">PNG, JPG up to 5MB</p>
                    <label className="inline-block">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={(e) => e.target.files[0] && handleLogoFile(e.target.files[0])}
                        className="hidden"
                      />
                      <span className="px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-dark text-sm">
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
                  {userData?.recruiterProfile?.businessProofUrl && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Current Document:</p>
                      <a
                        href={getFileUrl(userData.recruiterProfile.businessProofUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center space-x-2"
                      >
                        <FaFile />
                        <span>View Current Document</span>
                      </a>
                    </div>
                  )}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FaUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload business registration</p>
                    <p className="text-xs text-gray-500 mb-2">PDF, PNG, DOC up to 10MB</p>
                    <p className="text-xs text-gray-400 mb-4">
                      Upload business registration, tax certificate, or incorporation document
                    </p>
                    <label className="inline-block">
                      <input
                        type="file"
                        accept=".pdf,.png,.doc,.docx"
                        onChange={(e) => e.target.files[0] && handleProofFile(e.target.files[0])}
                        className="hidden"
                      />
                      <span className="px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-dark text-sm">
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
                    value={domainEmail}
                    onChange={(e) => setDomainEmail(e.target.value)}
                    placeholder={userData?.recruiterProfile?.domainEmail || "admin@yourcompany.com"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {userData?.recruiterProfile?.domainEmail 
                      ? "Update domain email for verification" 
                      : "We'll send a verification link to confirm domain ownership"}
                  </p>
                </div>

                {/* Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Note:</span> Your account will be under review for 24-48 hours. You'll receive an email once verified.
                  </p>
                </div>

                <button
                  onClick={handleDocumentsUpload}
                  disabled={(!companyLogo && !businessProof && !domainEmail) || loading}
                  className="w-full px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FaUpload />
                      <span>Update Documents</span>
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
