import React from 'react';

const ProgressBar = ({ currentStep, totalSteps = 4 }) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
        <span className="text-sm text-gray-600">{Math.round(percentage)}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;

