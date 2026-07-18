import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SignIn from './pages/auth/SignIn'
import CandidateSignUp from './pages/auth/CandidateSignUp'
import RecruiterSignUp from './pages/auth/RecruiterSignUp'
import CandidateQuestionnaire from './pages/questionnaire/CandidateQuestionnaire'
import RecruiterQuestionnaire from './pages/questionnaire/RecruiterQuestionnaire'
import Dashboard from './pages/Dashboard'
import BrowseJobs from './pages/candidate/BrowseJobs'
import JobDetails from './pages/candidate/JobDetails'
import Applications from './pages/candidate/Applications'
import ApplicationDetail from './pages/candidate/ApplicationDetail'
import Interviews from './pages/candidate/Interviews'
import ResumeParser from './pages/candidate/ResumeParser'
import TakeTest from './pages/candidate/TakeTest'
import TestResult from './pages/candidate/TestResult'
import RecruiterInterviews from './pages/recruiter/Interviews'
import RecruiterJobs from './pages/recruiter/Jobs'
import RecruiterJobDetail from './pages/recruiter/JobDetail'
import RecruiterApplications from './pages/recruiter/Applications'
import RecruiterApplicationDetail from './pages/recruiter/ApplicationDetail'
import AptitudeTests from './pages/recruiter/AptitudeTests'
import AptitudeTestDetail from './pages/recruiter/AptitudeTestDetail'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup/candidate" element={<CandidateSignUp />} />
        <Route path="/signup/recruiter" element={<RecruiterSignUp />} />
        <Route 
          path="/questionnaire/candidate" 
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <CandidateQuestionnaire />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/questionnaire/recruiter" 
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <RecruiterQuestionnaire />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['candidate', 'recruiter']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/browse-jobs" 
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <Sidebar>
                <BrowseJobs />
              </Sidebar>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/jobs/:id" 
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <Sidebar>
                <JobDetails />
              </Sidebar>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/applications" 
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <Sidebar>
                <Applications />
              </Sidebar>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/applications/:id" 
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <Sidebar>
                <ApplicationDetail />
              </Sidebar>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/interviews" 
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <Sidebar>
                <Interviews />
              </Sidebar>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resume-parser" 
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <Sidebar>
                <ResumeParser />
              </Sidebar>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/jobs/:jobId/take-test" 
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <Sidebar>
                <TakeTest />
              </Sidebar>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/jobs/:jobId/test-result" 
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <Sidebar>
                <TestResult />
              </Sidebar>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recruiter/interviews" 
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <Sidebar>
                <RecruiterInterviews />
              </Sidebar>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recruiter/jobs" 
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <Sidebar>
                <RecruiterJobs />
              </Sidebar>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recruiter/jobs/:id" 
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <Sidebar>
                <RecruiterJobDetail />
              </Sidebar>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recruiter/applications" 
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <Sidebar>
                <RecruiterApplications />
              </Sidebar>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recruiter/applications/:id" 
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <Sidebar>
                <RecruiterApplicationDetail />
              </Sidebar>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recruiter/aptitude-tests" 
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <Sidebar>
                <AptitudeTests />
              </Sidebar>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recruiter/aptitude-tests/:id" 
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <Sidebar>
                <AptitudeTestDetail />
              </Sidebar>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App

