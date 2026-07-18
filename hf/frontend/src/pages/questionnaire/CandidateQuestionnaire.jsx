import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1About from '../../components/questionnaire/candidate/Step1About';
import Step2Education from '../../components/questionnaire/candidate/Step2Education';
import Step3Experience from '../../components/questionnaire/candidate/Step3Experience';
import Step4Resume from '../../components/questionnaire/candidate/Step4Resume';
import { getCurrentUser } from '../../services/authService';

const CandidateQuestionnaire = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFresher, setIsFresher] = useState(false);

  const loadUserData = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success && response.data.user) {
        setUserData(response.data.user);
        const fresherStatus = response.data.user.candidateProfile?.isFresher || false;
        setIsFresher(fresherStatus);
        // If questionnaire is already completed, redirect to dashboard
        if (response.data.user.candidateProfile?.questionnaireCompleted) {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [navigate]);

  // Calculate total steps based on fresher status
  const totalSteps = isFresher ? 3 : 4;

  const handleNext = () => {
    if (currentStep === 1) {
      // Step 1 -> Step 2 (Education)
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Step 2 -> Step 3 or Step 4
      if (isFresher) {
        setCurrentStep(3); // Skip Experience, go to Resume (shown as step 3 for freshers)
      } else {
        setCurrentStep(3); // Go to Experience (step 3)
      }
    } else if (currentStep === 3 && !isFresher) {
      // From Experience (step 3), go to Resume (step 4)
      setCurrentStep(4);
    }
    // If at Resume step, completion is handled by Step4Resume's onComplete
  };

  const handleBack = () => {
    if (currentStep === 3 && isFresher) {
      // From Resume (step 3 for freshers), go back to Education (step 2)
      setCurrentStep(2);
    } else if (currentStep === 4) {
      // From Resume (step 4 for non-freshers), go back to Experience (step 3)
      setCurrentStep(3);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStep1Complete = async () => {
    try {
      // Reload user data to get updated isFresher status
      const response = await getCurrentUser();
      if (response.success && response.data.user) {
        const fresherStatus = response.data.user.candidateProfile?.isFresher || false;
        setUserData(response.data.user);
        setIsFresher(fresherStatus);
        // Go to step 2 (Education)
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Error reloading user data:', error);
      // Still proceed to step 2 even if reload fails
      setCurrentStep(2);
    }
  };

  const handleComplete = () => {
    // Navigate to dashboard after completing questionnaire
    navigate('/dashboard');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  // Calculate display step number for progress bar
  // For freshers: steps 1, 2, 3 (where 3 is Resume)
  // For non-freshers: steps 1, 2, 3 (Experience), 4 (Resume)
  const getDisplayStep = () => {
    if (!isFresher) {
      return currentStep; // 1, 2, 3, 4
    } else {
      // For freshers: steps 1, 2, 3 (but step 3 is Resume)
      if (currentStep <= 2) return currentStep;
      if (currentStep === 3) return 3; // Resume is shown as step 3
      return currentStep;
    }
  };

  const displayStep = getDisplayStep();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {currentStep === 1 && (
          <Step1About
            userData={userData}
            onNext={handleStep1Complete}
            onBack={handleBack}
            currentStep={displayStep}
            totalSteps={totalSteps}
          />
        )}
        {currentStep === 2 && (
          <Step2Education
            onNext={handleNext}
            onBack={handleBack}
            currentStep={displayStep}
            totalSteps={totalSteps}
          />
        )}
        {!isFresher && currentStep === 3 && (
          <Step3Experience
            userData={userData}
            onNext={handleNext}
            onBack={handleBack}
            currentStep={displayStep}
            totalSteps={totalSteps}
          />
        )}
        {((isFresher && currentStep === 3) || (!isFresher && currentStep === 4)) && (
          <Step4Resume
            onComplete={handleComplete}
            onBack={handleBack}
            currentStep={displayStep}
            totalSteps={totalSteps}
          />
        )}
      </div>
    </div>
  );
};

export default CandidateQuestionnaire;

