require('dotenv').config();
const { syncDatabase, User, Candidate, Recruiter, Education, Experience, Skill, RecruiterExperience, RecruiterSkill, Job, JobSkill, JobApplication, Interview, SavedJob, AptitudeTest, AptitudeQuestion, TestSubmission } = require('../models');
const bcrypt = require('bcryptjs');

/**
 * Complete seeding file with all data including aptitude tests and submissions
 * Seeds: Users, Candidates, Recruiters, Education, Experience, Skills, Jobs, Applications, Interviews, Saved Jobs, Aptitude Tests, Test Submissions
 */
const seedComplete = async () => {
  try {
    console.log('🌱 Starting complete seeding process...\n');

    // Sync database first
    await syncDatabase(false);

    // ============================================
    // 1. SEED USERS (Candidates & Recruiters)
    // ============================================
    console.log('📝 Seeding users...');

    const candidateUsers = [];
    const candidateEmails = [
      'candidate1@test.com', 'candidate2@test.com', 'candidate3@test.com',
      'candidate4@test.com', 'candidate5@test.com', 'candidate6@test.com',
      'candidate7@test.com', 'candidate8@test.com'
    ];
    const candidateNames = [
      'John Doe', 'Jane Smith', 'Michael Chen', 'Sarah Johnson',
      'David Brown', 'Emily Davis', 'Robert Wilson', 'Lisa Anderson'
    ];

    for (let i = 0; i < candidateEmails.length; i++) {
      const [user] = await User.findOrCreate({
        where: { email: candidateEmails[i] },
        defaults: {
          email: candidateEmails[i],
          password: 'password123',
          role: 'candidate',
          isActive: true,
          isVerified: true
        }
      });
      candidateUsers.push(user);
    }

    const recruiterUsers = [];
    const recruiterEmails = [
      'recruiter1@test.com', 'recruiter2@test.com', 'recruiter3@test.com'
    ];
    const recruiterNames = [
      'Alice Johnson', 'Bob Williams', 'Carol Martinez'
    ];

    for (let i = 0; i < recruiterEmails.length; i++) {
      const [user] = await User.findOrCreate({
        where: { email: recruiterEmails[i] },
        defaults: {
          email: recruiterEmails[i],
          password: 'password123',
          role: 'recruiter',
          isActive: true,
          isVerified: true
        }
      });
      recruiterUsers.push(user);
    }

    // ============================================
    // 2. SEED CANDIDATES
    // ============================================
    console.log('👤 Seeding candidates...');

    const candidates = [];
    const candidateData = [
      { name: 'John Doe', location: 'New York, USA', isFresher: false, contact: '+1234567890' },
      { name: 'Jane Smith', location: 'San Francisco, USA', isFresher: true, contact: '+1234567891' },
      { name: 'Michael Chen', location: 'Los Angeles, USA', isFresher: false, contact: '+1234567892' },
      { name: 'Sarah Johnson', location: 'Chicago, USA', isFresher: false, contact: '+1234567893' },
      { name: 'David Brown', location: 'Austin, USA', isFresher: true, contact: '+1234567894' },
      { name: 'Emily Davis', location: 'Denver, USA', isFresher: false, contact: '+1234567895' },
      { name: 'Robert Wilson', location: 'Seattle, USA', isFresher: false, contact: '+1234567896' },
      { name: 'Lisa Anderson', location: 'Boston, USA', isFresher: true, contact: '+1234567897' }
    ];

    for (let i = 0; i < candidateUsers.length; i++) {
      const [candidate] = await Candidate.findOrCreate({
        where: { userId: candidateUsers[i].id },
        defaults: {
          userId: candidateUsers[i].id,
          fullName: candidateData[i].name,
          contactNumber: candidateData[i].contact,
          location: candidateData[i].location,
          isFresher: candidateData[i].isFresher,
          questionnaireCompleted: true
        }
      });
      candidates.push(candidate);
    }

    // ============================================
    // 3. SEED RECRUITERS
    // ============================================
    console.log('🏢 Seeding recruiters...');

    const recruiters = [];
    const recruiterData = [
      { name: 'Alice Johnson', company: 'Tech Corp', location: 'Seattle, USA', size: '201-500', industry: 'Technology' },
      { name: 'Bob Williams', company: 'Innovate Solutions', location: 'Boston, USA', size: '51-200', industry: 'Consulting' },
      { name: 'Carol Martinez', company: 'Digital Ventures', location: 'Austin, USA', size: '11-50', industry: 'Startup' }
    ];

    for (let i = 0; i < recruiterUsers.length; i++) {
      const [recruiter] = await Recruiter.findOrCreate({
        where: { userId: recruiterUsers[i].id },
        defaults: {
          userId: recruiterUsers[i].id,
          fullName: recruiterData[i].name,
          role: 'HR Manager',
          contactNumber: `+1234567${900 + i}`,
          companyName: recruiterData[i].company,
          companyWebsite: `https://${recruiterData[i].company.toLowerCase().replace(/\s+/g, '')}.com`,
          industryType: recruiterData[i].industry,
          companySize: recruiterData[i].size,
          headquartersLocation: recruiterData[i].location,
          isVerified: true,
          questionnaireCompleted: true
        }
      });
      recruiters.push(recruiter);
    }

    // ============================================
    // 4. SEED CANDIDATE EDUCATION
    // ============================================
    console.log('🎓 Seeding candidate education...');

    const educationData = [
      { candidate: 0, degree: 'Bachelor of Science in Computer Science', institution: 'MIT', year: 2020 },
      { candidate: 0, degree: 'Master of Science in Software Engineering', institution: 'Stanford University', year: 2022 },
      { candidate: 1, degree: 'Bachelor of Science in Information Systems', institution: 'UC Berkeley', year: 2023 },
      { candidate: 2, degree: 'Bachelor of Science in Computer Engineering', institution: 'UCLA', year: 2019 },
      { candidate: 2, degree: 'Master of Science in Computer Science', institution: 'USC', year: 2021 },
      { candidate: 3, degree: 'Bachelor of Science in Software Engineering', institution: 'Northwestern University', year: 2020 },
      { candidate: 4, degree: 'Bachelor of Science in Computer Science', institution: 'UT Austin', year: 2024 },
      { candidate: 5, degree: 'Bachelor of Science in Information Technology', institution: 'University of Colorado', year: 2018 },
      { candidate: 5, degree: 'Master of Business Administration', institution: 'University of Colorado', year: 2020 },
      { candidate: 6, degree: 'Bachelor of Science in Computer Science', institution: 'University of Washington', year: 2019 },
      { candidate: 7, degree: 'Bachelor of Science in Information Systems', institution: 'Boston University', year: 2023 }
    ];

    for (const edu of educationData) {
      await Education.findOrCreate({
        where: {
          candidateId: candidates[edu.candidate].id,
          degree: edu.degree,
          institution: edu.institution
        },
        defaults: {
          candidateId: candidates[edu.candidate].id,
          degree: edu.degree,
          institution: edu.institution,
          yearOfCompletion: edu.year
        }
      });
    }

    // ============================================
    // 5. SEED CANDIDATE EXPERIENCE
    // ============================================
    console.log('💼 Seeding candidate experience...');

    const experienceData = [
      { candidate: 0, company: 'Google', role: 'Software Engineer', from: '2022-06-01', to: '2024-01-01', current: false },
      { candidate: 0, company: 'Microsoft', role: 'Senior Software Engineer', from: '2024-01-15', to: null, current: true },
      { candidate: 2, company: 'Amazon', role: 'Software Development Engineer', from: '2021-07-01', to: '2023-12-01', current: false },
      { candidate: 2, company: 'Netflix', role: 'Senior Software Engineer', from: '2024-01-01', to: null, current: true },
      { candidate: 3, company: 'Meta', role: 'Frontend Developer', from: '2020-08-01', to: null, current: true },
      { candidate: 5, company: 'Oracle', role: 'Full Stack Developer', from: '2020-06-01', to: '2022-12-01', current: false },
      { candidate: 5, company: 'Salesforce', role: 'Lead Software Engineer', from: '2023-01-01', to: null, current: true },
      { candidate: 6, company: 'Apple', role: 'iOS Developer', from: '2019-09-01', to: '2022-05-01', current: false },
      { candidate: 6, company: 'Tesla', role: 'Senior iOS Developer', from: '2022-06-01', to: null, current: true }
    ];

    for (const exp of experienceData) {
      await Experience.findOrCreate({
        where: {
          candidateId: candidates[exp.candidate].id,
          companyName: exp.company,
          role: exp.role
        },
        defaults: {
          candidateId: candidates[exp.candidate].id,
          companyName: exp.company,
          role: exp.role,
          fromDate: new Date(exp.from),
          toDate: exp.to ? new Date(exp.to) : null,
          isCurrent: exp.current
        }
      });
    }

    // ============================================
    // 6. SEED CANDIDATE SKILLS
    // ============================================
    console.log('🛠️  Seeding candidate skills...');

    const skillsData = [
      { candidate: 0, skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express.js', 'TypeScript', 'AWS'] },
      { candidate: 1, skills: ['Python', 'Django', 'PostgreSQL', 'Git', 'HTML', 'CSS'] },
      { candidate: 2, skills: ['Java', 'Spring Boot', 'Microservices', 'AWS', 'Docker', 'Kubernetes', 'MongoDB'] },
      { candidate: 3, skills: ['React', 'Vue.js', 'TypeScript', 'Redux', 'Jest', 'Webpack', 'SASS'] },
      { candidate: 4, skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express.js', 'Git'] },
      { candidate: 5, skills: ['C#', '.NET', 'SQL Server', 'Azure', 'Angular', 'Entity Framework', 'RESTful APIs'] },
      { candidate: 6, skills: ['Swift', 'iOS', 'Objective-C', 'Xcode', 'Core Data', 'UIKit', 'SwiftUI'] },
      { candidate: 7, skills: ['Python', 'Flask', 'PostgreSQL', 'Docker', 'Linux', 'Git'] }
    ];

    for (const skillSet of skillsData) {
      for (const skillName of skillSet.skills) {
        await Skill.findOrCreate({
          where: {
            candidateId: candidates[skillSet.candidate].id,
            name: skillName
          },
          defaults: {
            candidateId: candidates[skillSet.candidate].id,
            name: skillName
          }
        });
      }
    }

    // ============================================
    // 7. SEED JOBS
    // ============================================
    console.log('💼 Seeding jobs...');

    const jobsData = [
      {
        title: 'Senior Full Stack Developer',
        company: 'Tech Corp',
        location: 'Seattle, USA',
        type: 'Full-time',
        mode: 'Hybrid',
        experience: '3-5 years',
        salaryMin: 100000,
        salaryMax: 150000,
        description: 'We are looking for an experienced Full Stack Developer to join our team. You will work on both frontend and backend systems, building scalable applications.',
        requirements: '• 3-5 years of full-stack development experience\n• Strong knowledge of React and Node.js\n• Experience with PostgreSQL\n• Understanding of RESTful APIs\n• Good problem-solving skills',
        benefits: '• Competitive salary and benefits package\n• Health, dental, and vision insurance\n• Flexible working hours\n• Remote work options\n• Professional development opportunities',
        skills: ['React', 'Node.js', 'PostgreSQL', 'JavaScript', 'TypeScript'],
        recruiter: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        testDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 days from now
        testStartTime: '10:00',
        testEndTime: '11:30'
      },
      {
        title: 'Frontend Developer',
        company: 'Innovate Solutions',
        location: 'Boston, USA',
        type: 'Full-time',
        mode: 'Remote',
        experience: '1-3 years',
        salaryMin: 70000,
        salaryMax: 100000,
        description: 'Join our team as a Frontend Developer and help build beautiful user interfaces. You will work with modern frameworks and tools.',
        requirements: '• 1-3 years of frontend development experience\n• Proficiency in React and JavaScript\n• Experience with responsive design\n• Knowledge of modern frontend tools',
        benefits: '• Fully remote work\n• Competitive salary\n• Health insurance\n• Flexible PTO\n• Learning budget',
        skills: ['React', 'JavaScript', 'CSS', 'HTML', 'TypeScript'],
        recruiter: 1,
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        testDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        testStartTime: '14:00',
        testEndTime: '15:30'
      },
      {
        title: 'Backend Developer',
        company: 'Tech Corp',
        location: 'Seattle, USA',
        type: 'Full-time',
        mode: 'On-site',
        experience: '2-4 years',
        salaryMin: 90000,
        salaryMax: 130000,
        description: 'We need a Backend Developer to build robust APIs and services. Work on high-performance systems.',
        requirements: '• 2-4 years of backend development experience\n• Strong knowledge of Node.js or Python\n• Experience with databases\n• Understanding of microservices',
        benefits: '• Competitive salary\n• Health and dental insurance\n• 401(k) matching\n• On-site perks\n• Professional development',
        skills: ['Node.js', 'PostgreSQL', 'Express.js', 'RESTful APIs', 'Docker'],
        recruiter: 0,
        deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        testDate: null,
        testStartTime: null,
        testEndTime: null
      },
      {
        title: 'Software Engineer Intern',
        company: 'Innovate Solutions',
        location: 'Boston, USA',
        type: 'Internship',
        mode: 'Hybrid',
        experience: '0-1 years',
        salaryMin: 30000,
        salaryMax: 40000,
        description: 'Perfect opportunity for students or recent graduates to gain hands-on experience in software development.',
        requirements: '• Currently pursuing or recently completed a degree in Computer Science\n• Basic knowledge of programming languages\n• Eagerness to learn and grow',
        benefits: '• Mentorship from senior developers\n• Networking opportunities\n• Potential for full-time conversion\n• Flexible schedule',
        skills: ['JavaScript', 'Python', 'Git', 'HTML', 'CSS'],
        recruiter: 1,
        deadline: null,
        testDate: null,
        testStartTime: null,
        testEndTime: null
      },
      {
        title: 'React Native Developer',
        company: 'Digital Ventures',
        location: 'Austin, USA',
        type: 'Full-time',
        mode: 'Remote',
        experience: '2-4 years',
        salaryMin: 85000,
        salaryMax: 115000,
        description: 'Build amazing mobile applications using React Native. Work on both iOS and Android platforms.',
        requirements: '• 2-4 years of React Native experience\n• Strong knowledge of React and JavaScript\n• Experience with mobile app deployment\n• Understanding of native mobile development',
        benefits: '• Competitive salary\n• Health and dental insurance\n• Flexible work schedule\n• Mobile device budget\n• Conference attendance',
        skills: ['React Native', 'React', 'JavaScript', 'iOS', 'Android'],
        recruiter: 2,
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        testDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        testStartTime: '09:00',
        testEndTime: '10:30'
      },
      {
        title: 'DevOps Engineer',
        company: 'Tech Corp',
        location: 'Seattle, USA',
        type: 'Full-time',
        mode: 'Remote',
        experience: '3-5 years',
        salaryMin: 100000,
        salaryMax: 140000,
        description: 'Manage and optimize our cloud infrastructure. Ensure high availability and performance of our systems.',
        requirements: '• 3-5 years of DevOps experience\n• Strong knowledge of AWS, Azure, or GCP\n• Experience with CI/CD pipelines\n• Knowledge of containerization (Docker, Kubernetes)',
        benefits: '• Competitive salary\n• Full remote work\n• Health insurance\n• Learning budget\n• Equipment provided',
        skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
        recruiter: 0,
        deadline: null,
        testDate: null,
        testStartTime: null,
        testEndTime: null
      },
      {
        title: 'UI/UX Designer',
        company: 'Digital Ventures',
        location: 'Austin, USA',
        type: 'Full-time',
        mode: 'Hybrid',
        experience: '2-4 years',
        salaryMin: 70000,
        salaryMax: 95000,
        description: 'Create beautiful and intuitive user interfaces. Work closely with developers to bring designs to life.',
        requirements: '• 2-4 years of UI/UX design experience\n• Proficiency in Figma, Sketch, or Adobe XD\n• Strong portfolio\n• Understanding of user research',
        benefits: '• Competitive salary\n• Health benefits\n• Design software budget\n• Flexible schedule\n• Creative freedom',
        skills: ['Figma', 'UI/UX', 'User Research', 'Prototyping', 'Design Systems'],
        recruiter: 2,
        deadline: null,
        testDate: null,
        testStartTime: null,
        testEndTime: null
      },
      {
        title: 'Data Engineer',
        company: 'Innovate Solutions',
        location: 'Boston, USA',
        type: 'Full-time',
        mode: 'On-site',
        experience: '3-5 years',
        salaryMin: 110000,
        salaryMax: 150000,
        description: 'Build and maintain data pipelines. Work with large datasets and ensure data quality and reliability.',
        requirements: '• 3-5 years of data engineering experience\n• Strong knowledge of Python and SQL\n• Experience with data warehouses (Snowflake, BigQuery)\n• Knowledge of ETL processes',
        benefits: '• Competitive salary\n• Health and dental insurance\n• 401(k) matching\n• Professional development\n• On-site perks',
        skills: ['Python', 'SQL', 'Apache Spark', 'Snowflake', 'ETL'],
        recruiter: 1,
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        testDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        testStartTime: '13:00',
        testEndTime: '14:30'
      }
    ];

    const createdJobs = [];
    for (const jobData of jobsData) {
      const { skills, recruiter, deadline, testDate, testStartTime, testEndTime, ...jobFields } = jobData;
      
      const [job, created] = await Job.findOrCreate({
        where: {
          title: jobFields.title,
          companyName: jobFields.company,
          recruiterId: recruiters[recruiter].id
        },
        defaults: {
          ...jobFields,
          companyName: jobFields.company,
          recruiterId: recruiters[recruiter].id,
          isActive: true,
          applicationDeadline: deadline,
          testDate: testDate,
          testStartTime: testStartTime,
          testEndTime: testEndTime
        }
      });

      if (created || !(await JobSkill.count({ where: { jobId: job.id } }))) {
        await JobSkill.destroy({ where: { jobId: job.id } });
        for (const skillName of skills) {
          await JobSkill.create({
            jobId: job.id,
            skillName
          });
        }
      }

      createdJobs.push(job);
    }

    // ============================================
    // 8. SEED APTITUDE TESTS
    // ============================================
    console.log('📝 Seeding aptitude tests...');

    const testQuestions = [
      {
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Which data structure follows LIFO principle?',
        options: ['Queue', 'Stack', 'Array', 'Linked List'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What does REST stand for?',
        options: ['Representational State Transfer', 'Remote State Transfer', 'Resource State Transfer', 'Representative State Transfer'],
        correctAnswer: 0,
        points: 10
      },
      {
        question: 'Which HTTP method is used to create a resource?',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What is the purpose of a database index?',
        options: ['To store data', 'To improve query performance', 'To backup data', 'To delete data'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Which of the following is not a JavaScript framework?',
        options: ['React', 'Angular', 'Vue', 'Django'],
        correctAnswer: 3,
        points: 10
      },
      {
        question: 'What is the default port for HTTP?',
        options: ['80', '443', '8080', '3000'],
        correctAnswer: 0,
        points: 10
      },
      {
        question: 'Which algorithm is used for sorting in JavaScript sort()?',
        options: ['Quick Sort', 'Merge Sort', 'Bubble Sort', 'Implementation dependent'],
        correctAnswer: 3,
        points: 10
      },
      {
        question: 'What is the purpose of CSS media queries?',
        options: ['To style elements', 'To make responsive designs', 'To add animations', 'To optimize images'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What is a closure in JavaScript?',
        options: ['A function that has access to variables in its outer scope', 'A way to close a file', 'A type of loop', 'A data structure'],
        correctAnswer: 0,
        points: 10
      }
    ];

    // Create tests for jobs that have test dates
    const jobsWithTests = createdJobs.filter((job, index) => jobsData[index].testDate);
    for (const job of jobsWithTests) {
      const [test, created] = await AptitudeTest.findOrCreate({
        where: {
          jobId: job.id,
          recruiterId: job.recruiterId
        },
        defaults: {
          jobId: job.id,
          recruiterId: job.recruiterId,
          title: `Aptitude Test - ${job.title}`,
          description: 'Technical aptitude test for this position',
          numberOfQuestions: testQuestions.length,
          passingPercentage: 60,
          timeLimit: 30 // 30 minutes
        }
      });

      if (created || !(await AptitudeQuestion.count({ where: { testId: test.id } }))) {
        await AptitudeQuestion.destroy({ where: { testId: test.id } });
        for (const q of testQuestions) {
          await AptitudeQuestion.create({
            testId: test.id,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer
          });
        }
      }
    }

    // ============================================
    // 9. SEED JOB APPLICATIONS
    // ============================================
    console.log('📄 Seeding job applications...');

    const applicationStatuses = ['Applied', 'Under Review', 'Interview', 'Offer', 'Rejected'];
    const applications = [];

    // Create applications with various statuses
    const applicationData = [
      { candidate: 0, job: 0, status: 'Under Review', daysAgo: 5 },
      { candidate: 0, job: 1, status: 'Interview', daysAgo: 10 },
      { candidate: 0, job: 2, status: 'Applied', daysAgo: 2 },
      { candidate: 1, job: 1, status: 'Applied', daysAgo: 3 },
      { candidate: 1, job: 3, status: 'Under Review', daysAgo: 7 },
      { candidate: 2, job: 0, status: 'Interview', daysAgo: 8 },
      { candidate: 2, job: 4, status: 'Applied', daysAgo: 1 },
      { candidate: 3, job: 1, status: 'Offer', daysAgo: 12 },
      { candidate: 3, job: 2, status: 'Rejected', daysAgo: 15 },
      { candidate: 4, job: 3, status: 'Applied', daysAgo: 4 },
      { candidate: 4, job: 4, status: 'Under Review', daysAgo: 6 },
      { candidate: 5, job: 0, status: 'Interview', daysAgo: 9 },
      { candidate: 5, job: 5, status: 'Applied', daysAgo: 2 },
      { candidate: 6, job: 4, status: 'Under Review', daysAgo: 5 },
      { candidate: 7, job: 1, status: 'Applied', daysAgo: 1 }
    ];

    for (const appData of applicationData) {
      const [application] = await JobApplication.findOrCreate({
        where: {
          jobId: createdJobs[appData.job].id,
          candidateId: candidates[appData.candidate].id
        },
        defaults: {
          jobId: createdJobs[appData.job].id,
          candidateId: candidates[appData.candidate].id,
          status: appData.status,
          resumeUrl: `/uploads/resumes/sample-resume-${appData.candidate + 1}.pdf`,
          coverLetter: `I am very interested in this position and believe my experience aligns well with your requirements.`,
          appliedAt: new Date(Date.now() - appData.daysAgo * 24 * 60 * 60 * 1000)
        }
      });
      applications.push(application);
    }

    // ============================================
    // 10. SEED TEST SUBMISSIONS
    // ============================================
    console.log('✅ Seeding test submissions...');

    // Get tests and create submissions for some applications
    const tests = await AptitudeTest.findAll();
    for (const test of tests) {
      // Find applications for this job
      const jobApplications = applications.filter(app => app.jobId === test.jobId);
      
      // Create submissions for some applications (not all)
      const questions = await AptitudeQuestion.findAll({ where: { testId: test.id } });
      for (let i = 0; i < Math.min(3, jobApplications.length); i++) {
        const app = jobApplications[i];
        // Create answers object mapping question IDs to selected answer indices
        const answersObj = {};
        let correctCount = 0;
        for (const question of questions) {
          const selectedAnswer = Math.floor(Math.random() * 4);
          answersObj[question.id] = selectedAnswer;
          if (selectedAnswer === question.correctAnswer) {
            correctCount++;
          }
        }
        const totalQuestions = questions.length;
        const score = Math.round((correctCount / totalQuestions) * 100);
        const isPassed = score >= 60;

        await TestSubmission.findOrCreate({
          where: {
            testId: test.id,
            candidateId: app.candidateId,
            jobApplicationId: app.id
          },
          defaults: {
            testId: test.id,
            candidateId: app.candidateId,
            jobApplicationId: app.id,
            answers: answersObj,
            score: score,
            totalQuestions: totalQuestions,
            correctAnswers: correctCount,
            isPassed: isPassed,
            submittedAt: new Date()
          }
        });
      }
    }

    // ============================================
    // 11. SEED INTERVIEWS
    // ============================================
    console.log('📅 Seeding interviews...');

    // Get applications with Interview status
    const interviewApplications = applications.filter(app => app.status === 'Interview');
    for (const app of interviewApplications) {
      const job = createdJobs.find(j => j.id === app.jobId);
      if (job) {
        const interviewDate = new Date(Date.now() + (Math.floor(Math.random() * 14) + 3) * 24 * 60 * 60 * 1000); // 3-17 days from now
        const hours = Math.floor(Math.random() * 8) + 9; // 9 AM to 5 PM
        const minutes = [0, 30][Math.floor(Math.random() * 2)];
        const interviewTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const isOnline = Math.random() > 0.5;

        await Interview.findOrCreate({
          where: {
            recruiterId: job.recruiterId,
            jobId: app.jobId,
            candidateId: app.candidateId
          },
          defaults: {
            recruiterId: job.recruiterId,
            jobId: app.jobId,
            candidateId: app.candidateId,
            interviewDate: interviewDate.toISOString().split('T')[0],
            interviewTime: interviewTime,
            mode: isOnline ? 'Online' : 'Offline',
            status: 'Scheduled',
            notes: `Technical interview focusing on relevant skills for ${job.title}.`,
            meetingLink: isOnline ? `https://meet.google.com/${Math.random().toString(36).substring(7)}` : null,
            location: isOnline ? null : `${job.location} Office`
          }
        });
      }
    }

    // ============================================
    // 12. SEED SAVED JOBS
    // ============================================
    console.log('⭐ Seeding saved jobs...');

    const savedJobsData = [
      { candidate: 0, job: 0 },
      { candidate: 0, job: 2 },
      { candidate: 1, job: 1 },
      { candidate: 2, job: 4 },
      { candidate: 3, job: 1 },
      { candidate: 4, job: 3 },
      { candidate: 5, job: 0 }
    ];

    for (const saved of savedJobsData) {
      await SavedJob.findOrCreate({
        where: {
          jobId: createdJobs[saved.job].id,
          candidateId: candidates[saved.candidate].id
        },
        defaults: {
          jobId: createdJobs[saved.job].id,
          candidateId: candidates[saved.candidate].id
        }
      });
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n✅ Complete seeding finished successfully!\n');
    console.log('📊 Seeding Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👥 Users: ${candidateUsers.length + recruiterUsers.length} (${candidateUsers.length} candidates, ${recruiterUsers.length} recruiters)`);
    console.log(`👤 Candidates: ${candidates.length}`);
    console.log(`🏢 Recruiters: ${recruiters.length}`);
    console.log(`🎓 Education Records: ${educationData.length}`);
    console.log(`💼 Experience Records: ${experienceData.length}`);
    console.log(`🛠️  Candidate Skills: ${skillsData.reduce((sum, s) => sum + s.skills.length, 0)}`);
    console.log(`💼 Jobs: ${createdJobs.length}`);
    console.log(`📝 Aptitude Tests: ${tests.length}`);
    console.log(`❓ Test Questions: ${tests.length * testQuestions.length}`);
    console.log(`📄 Job Applications: ${applications.length}`);
    console.log(`✅ Test Submissions: ${await TestSubmission.count()}`);
    console.log(`📅 Interviews: ${await Interview.count()}`);
    console.log(`⭐ Saved Jobs: ${savedJobsData.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔑 Test Credentials (Password: password123):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('CANDIDATES:');
    candidateEmails.forEach((email, i) => {
      console.log(`  • ${email} (${candidateNames[i]})`);
    });
    console.log('');
    console.log('RECRUITERS:');
    recruiterEmails.forEach((email, i) => {
      console.log(`  • ${email} (${recruiterNames[i]} - ${recruiterData[i].company})`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

// Export the function for use in runSeed.js
module.exports = seedComplete;

// If run directly, execute
if (require.main === module) {
  seedComplete();
}

