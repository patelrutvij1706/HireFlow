const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { syncDatabase, User, Candidate, Recruiter, Education, Experience, Skill, RecruiterExperience, RecruiterSkill, Job, JobSkill, JobApplication, Interview, SavedJob } = require('../models');
const bcrypt = require('bcryptjs');

const useInMemoryDb = process.env.USE_IN_MEMORY_DB === 'true';
const seedModels = [
  User,
  Candidate,
  Recruiter,
  Education,
  Experience,
  Skill,
  RecruiterExperience,
  RecruiterSkill,
  Job,
  JobSkill,
  JobApplication,
  Interview,
  SavedJob
];

const installFindOrCreateCompat = () => {
  if (!useInMemoryDb) {
    return () => {};
  }

  const originals = new Map();

  for (const model of seedModels) {
    originals.set(model, model.findOrCreate);
    model.findOrCreate = async function findOrCreateCompat(options = {}) {
      const existing = await model.findOne({ where: options.where });
      if (existing) {
        return [existing, false];
      }

      const values = {
        ...(options.where || {}),
        ...(options.defaults || {})
      };

      const created = await model.create(values);
      return [created, true];
    };
  }

  return () => {
    for (const model of seedModels) {
      const original = originals.get(model);
      if (original) {
        model.findOrCreate = original;
      }
    }
  };
};

/**
 * Comprehensive seeding file for all features
 * Seeds: Users, Candidates, Recruiters, Education, Experience, Skills, Jobs, Applications, Interviews, Saved Jobs
 */
const seedAll = async (options = {}) => {
  const { skipSync = false } = options;
  const restoreFindOrCreate = installFindOrCreateCompat();
  try {
    console.log('🌱 Starting comprehensive seeding process...\n');

    // Sync database first
    if (!skipSync) {
      await syncDatabase(false);
    }

    // ============================================
    // 1. SEED USERS (Candidates & Recruiters)
    // ============================================
    console.log('📝 Seeding users...');

    // Create Candidate Users
    const candidate1User = await User.findOrCreate({
      where: { email: 'candidate1@test.com' },
      defaults: {
        email: 'candidate1@test.com',
        password: 'password123',
        role: 'candidate',
        isActive: true,
        isVerified: true
      }
    }).then(([user]) => user);

    const candidate2User = await User.findOrCreate({
      where: { email: 'candidate2@test.com' },
      defaults: {
        email: 'candidate2@test.com',
        password: 'password123',
        role: 'candidate',
        isActive: true,
        isVerified: true
      }
    }).then(([user]) => user);

    const candidate3User = await User.findOrCreate({
      where: { email: 'candidate3@test.com' },
      defaults: {
        email: 'candidate3@test.com',
        password: 'password123',
        role: 'candidate',
        isActive: true,
        isVerified: true
      }
    }).then(([user]) => user);

    const candidate4User = await User.findOrCreate({
      where: { email: 'candidate4@test.com' },
      defaults: {
        email: 'candidate4@test.com',
        password: 'password123',
        role: 'candidate',
        isActive: true,
        isVerified: true
      }
    }).then(([user]) => user);

    const candidate5User = await User.findOrCreate({
      where: { email: 'candidate5@test.com' },
      defaults: {
        email: 'candidate5@test.com',
        password: 'password123',
        role: 'candidate',
        isActive: true,
        isVerified: true
      }
    }).then(([user]) => user);

    const candidate6User = await User.findOrCreate({
      where: { email: 'candidate6@test.com' },
      defaults: {
        email: 'candidate6@test.com',
        password: 'password123',
        role: 'candidate',
        isActive: true,
        isVerified: true
      }
    }).then(([user]) => user);

    // Create Recruiter Users
    const recruiter1User = await User.findOrCreate({
      where: { email: 'recruiter1@test.com' },
      defaults: {
        email: 'recruiter1@test.com',
        password: 'password123',
        role: 'recruiter',
        isActive: true,
        isVerified: true
      }
    }).then(([user]) => user);

    const recruiter2User = await User.findOrCreate({
      where: { email: 'recruiter2@test.com' },
      defaults: {
        email: 'recruiter2@test.com',
        password: 'password123',
        role: 'recruiter',
        isActive: true,
        isVerified: true
      }
    }).then(([user]) => user);

    // ============================================
    // 2. SEED CANDIDATES
    // ============================================
    console.log('👤 Seeding candidates...');

    const candidate1 = await Candidate.findOrCreate({
      where: { userId: candidate1User.id },
      defaults: {
        userId: candidate1User.id,
        fullName: 'John Doe',
        contactNumber: '+1234567890',
        location: 'New York, USA',
        isFresher: false,
        questionnaireCompleted: true
      }
    }).then(([candidate]) => candidate);

    const candidate2 = await Candidate.findOrCreate({
      where: { userId: candidate2User.id },
      defaults: {
        userId: candidate2User.id,
        fullName: 'Jane Smith',
        contactNumber: '+1234567891',
        location: 'San Francisco, USA',
        isFresher: true,
        questionnaireCompleted: true
      }
    }).then(([candidate]) => candidate);

    const candidate3 = await Candidate.findOrCreate({
      where: { userId: candidate3User.id },
      defaults: {
        userId: candidate3User.id,
        fullName: 'Michael Chen',
        contactNumber: '+1234567894',
        location: 'Los Angeles, USA',
        isFresher: false,
        questionnaireCompleted: true
      }
    }).then(([candidate]) => candidate);

    const candidate4 = await Candidate.findOrCreate({
      where: { userId: candidate4User.id },
      defaults: {
        userId: candidate4User.id,
        fullName: 'Sarah Johnson',
        contactNumber: '+1234567895',
        location: 'Chicago, USA',
        isFresher: false,
        questionnaireCompleted: true
      }
    }).then(([candidate]) => candidate);

    const candidate5 = await Candidate.findOrCreate({
      where: { userId: candidate5User.id },
      defaults: {
        userId: candidate5User.id,
        fullName: 'David Brown',
        contactNumber: '+1234567896',
        location: 'Austin, USA',
        isFresher: true,
        questionnaireCompleted: true
      }
    }).then(([candidate]) => candidate);

    const candidate6 = await Candidate.findOrCreate({
      where: { userId: candidate6User.id },
      defaults: {
        userId: candidate6User.id,
        fullName: 'Emily Davis',
        contactNumber: '+1234567897',
        location: 'Denver, USA',
        isFresher: false,
        questionnaireCompleted: true
      }
    }).then(([candidate]) => candidate);

    // ============================================
    // 3. SEED RECRUITERS
    // ============================================
    console.log('🏢 Seeding recruiters...');

    const recruiter1 = await Recruiter.findOrCreate({
      where: { userId: recruiter1User.id },
      defaults: {
        userId: recruiter1User.id,
        fullName: 'Alice Johnson',
        role: 'HR Manager',
        contactNumber: '+1234567892',
        linkedinProfile: 'https://linkedin.com/in/alice-johnson',
        companyName: 'Tech Corp',
        companyWebsite: 'https://techcorp.com',
        industryType: 'Technology',
        companySize: '201-500',
        headquartersLocation: 'Seattle, USA',
        isVerified: true,
        questionnaireCompleted: true
      }
    }).then(([recruiter]) => recruiter);

    const recruiter2 = await Recruiter.findOrCreate({
      where: { userId: recruiter2User.id },
      defaults: {
        userId: recruiter2User.id,
        fullName: 'Bob Williams',
        role: 'Talent Acquisition Lead',
        contactNumber: '+1234567893',
        linkedinProfile: 'https://linkedin.com/in/bob-williams',
        companyName: 'Innovate Solutions',
        companyWebsite: 'https://innovatesolutions.com',
        industryType: 'Consulting',
        companySize: '51-200',
        headquartersLocation: 'Boston, USA',
        isVerified: true,
        questionnaireCompleted: true
      }
    }).then(([recruiter]) => recruiter);

    // ============================================
    // 4. SEED CANDIDATE EDUCATION
    // ============================================
    console.log('🎓 Seeding candidate education...');

    await Education.findOrCreate({
      where: {
        candidateId: candidate1.id,
        degree: 'Bachelor of Science',
        institution: 'MIT'
      },
      defaults: {
        candidateId: candidate1.id,
        degree: 'Bachelor of Science in Computer Science',
        institution: 'Massachusetts Institute of Technology',
        yearOfCompletion: 2020
      }
    });

    await Education.findOrCreate({
      where: {
        candidateId: candidate1.id,
        degree: 'Master of Science',
        institution: 'Stanford University'
      },
      defaults: {
        candidateId: candidate1.id,
        degree: 'Master of Science in Software Engineering',
        institution: 'Stanford University',
        yearOfCompletion: 2022
      }
    });

    await Education.findOrCreate({
      where: {
        candidateId: candidate2.id,
        degree: 'Bachelor of Science',
        institution: 'UC Berkeley'
      },
      defaults: {
        candidateId: candidate2.id,
        degree: 'Bachelor of Science in Information Systems',
        institution: 'UC Berkeley',
        yearOfCompletion: 2023
      }
    });

    // Candidate 3 Education
    await Education.findOrCreate({
      where: {
        candidateId: candidate3.id,
        degree: 'Bachelor of Science',
        institution: 'UCLA'
      },
      defaults: {
        candidateId: candidate3.id,
        degree: 'Bachelor of Science in Computer Engineering',
        institution: 'University of California, Los Angeles',
        yearOfCompletion: 2019
      }
    });

    await Education.findOrCreate({
      where: {
        candidateId: candidate3.id,
        degree: 'Master of Science',
        institution: 'USC'
      },
      defaults: {
        candidateId: candidate3.id,
        degree: 'Master of Science in Computer Science',
        institution: 'University of Southern California',
        yearOfCompletion: 2021
      }
    });

    // Candidate 4 Education
    await Education.findOrCreate({
      where: {
        candidateId: candidate4.id,
        degree: 'Bachelor of Science',
        institution: 'Northwestern University'
      },
      defaults: {
        candidateId: candidate4.id,
        degree: 'Bachelor of Science in Software Engineering',
        institution: 'Northwestern University',
        yearOfCompletion: 2020
      }
    });

    // Candidate 5 Education
    await Education.findOrCreate({
      where: {
        candidateId: candidate5.id,
        degree: 'Bachelor of Science',
        institution: 'UT Austin'
      },
      defaults: {
        candidateId: candidate5.id,
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University of Texas at Austin',
        yearOfCompletion: 2024
      }
    });

    // Candidate 6 Education
    await Education.findOrCreate({
      where: {
        candidateId: candidate6.id,
        degree: 'Bachelor of Science',
        institution: 'University of Colorado'
      },
      defaults: {
        candidateId: candidate6.id,
        degree: 'Bachelor of Science in Information Technology',
        institution: 'University of Colorado Boulder',
        yearOfCompletion: 2018
      }
    });

    await Education.findOrCreate({
      where: {
        candidateId: candidate6.id,
        degree: 'Master of Business Administration',
        institution: 'University of Colorado'
      },
      defaults: {
        candidateId: candidate6.id,
        degree: 'Master of Business Administration',
        institution: 'University of Colorado Boulder',
        yearOfCompletion: 2020
      }
    });

    // ============================================
    // 5. SEED CANDIDATE EXPERIENCE
    // ============================================
    console.log('💼 Seeding candidate experience...');

    await Experience.findOrCreate({
      where: {
        candidateId: candidate1.id,
        companyName: 'Google',
        role: 'Software Engineer'
      },
      defaults: {
        candidateId: candidate1.id,
        companyName: 'Google',
        role: 'Software Engineer',
        fromDate: new Date('2022-06-01'),
        toDate: new Date('2024-01-01'),
        isCurrent: false
      }
    });

    await Experience.findOrCreate({
      where: {
        candidateId: candidate1.id,
        companyName: 'Microsoft',
        role: 'Senior Software Engineer'
      },
      defaults: {
        candidateId: candidate1.id,
        companyName: 'Microsoft',
        role: 'Senior Software Engineer',
        fromDate: new Date('2024-01-15'),
        toDate: null,
        isCurrent: true
      }
    });

    // Candidate 2 is a fresher, so no experience

    // Candidate 3 Experience
    await Experience.findOrCreate({
      where: {
        candidateId: candidate3.id,
        companyName: 'Amazon',
        role: 'Software Development Engineer'
      },
      defaults: {
        candidateId: candidate3.id,
        companyName: 'Amazon',
        role: 'Software Development Engineer',
        fromDate: new Date('2021-07-01'),
        toDate: new Date('2023-12-01'),
        isCurrent: false
      }
    });

    await Experience.findOrCreate({
      where: {
        candidateId: candidate3.id,
        companyName: 'Netflix',
        role: 'Senior Software Engineer'
      },
      defaults: {
        candidateId: candidate3.id,
        companyName: 'Netflix',
        role: 'Senior Software Engineer',
        fromDate: new Date('2024-01-01'),
        toDate: null,
        isCurrent: true
      }
    });

    // Candidate 4 Experience
    await Experience.findOrCreate({
      where: {
        candidateId: candidate4.id,
        companyName: 'Meta',
        role: 'Frontend Developer'
      },
      defaults: {
        candidateId: candidate4.id,
        companyName: 'Meta',
        role: 'Frontend Developer',
        fromDate: new Date('2020-08-01'),
        toDate: null,
        isCurrent: true
      }
    });

    // Candidate 5 is a fresher, so no experience

    // Candidate 6 Experience
    await Experience.findOrCreate({
      where: {
        candidateId: candidate6.id,
        companyName: 'Oracle',
        role: 'Full Stack Developer'
      },
      defaults: {
        candidateId: candidate6.id,
        companyName: 'Oracle',
        role: 'Full Stack Developer',
        fromDate: new Date('2020-06-01'),
        toDate: new Date('2022-12-01'),
        isCurrent: false
      }
    });

    await Experience.findOrCreate({
      where: {
        candidateId: candidate6.id,
        companyName: 'Salesforce',
        role: 'Lead Software Engineer'
      },
      defaults: {
        candidateId: candidate6.id,
        companyName: 'Salesforce',
        role: 'Lead Software Engineer',
        fromDate: new Date('2023-01-01'),
        toDate: null,
        isCurrent: true
      }
    });

    // ============================================
    // 6. SEED CANDIDATE SKILLS
    // ============================================
    console.log('🛠️  Seeding candidate skills...');

    const candidate1Skills = ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express.js', 'TypeScript', 'AWS'];
    for (const skillName of candidate1Skills) {
      await Skill.findOrCreate({
        where: {
          candidateId: candidate1.id,
          name: skillName
        },
        defaults: {
          candidateId: candidate1.id,
          name: skillName
        }
      });
    }

    const candidate2Skills = ['Python', 'Django', 'PostgreSQL', 'Git', 'HTML', 'CSS'];
    for (const skillName of candidate2Skills) {
      await Skill.findOrCreate({
        where: {
          candidateId: candidate2.id,
          name: skillName
        },
        defaults: {
          candidateId: candidate2.id,
          name: skillName
        }
      });
    }

    // Candidate 3 Skills
    const candidate3Skills = ['Java', 'Spring Boot', 'Microservices', 'AWS', 'Docker', 'Kubernetes', 'MongoDB'];
    for (const skillName of candidate3Skills) {
      await Skill.findOrCreate({
        where: {
          candidateId: candidate3.id,
          name: skillName
        },
        defaults: {
          candidateId: candidate3.id,
          name: skillName
        }
      });
    }

    // Candidate 4 Skills
    const candidate4Skills = ['React', 'Vue.js', 'TypeScript', 'Redux', 'Jest', 'Webpack', 'SASS'];
    for (const skillName of candidate4Skills) {
      await Skill.findOrCreate({
        where: {
          candidateId: candidate4.id,
          name: skillName
        },
        defaults: {
          candidateId: candidate4.id,
          name: skillName
        }
      });
    }

    // Candidate 5 Skills
    const candidate5Skills = ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express.js', 'Git'];
    for (const skillName of candidate5Skills) {
      await Skill.findOrCreate({
        where: {
          candidateId: candidate5.id,
          name: skillName
        },
        defaults: {
          candidateId: candidate5.id,
          name: skillName
        }
      });
    }

    // Candidate 6 Skills
    const candidate6Skills = ['C#', '.NET', 'SQL Server', 'Azure', 'Angular', 'Entity Framework', 'RESTful APIs'];
    for (const skillName of candidate6Skills) {
      await Skill.findOrCreate({
        where: {
          candidateId: candidate6.id,
          name: skillName
        },
        defaults: {
          candidateId: candidate6.id,
          name: skillName
        }
      });
    }

    // ============================================
    // 7. SEED RECRUITER EXPERIENCE
    // ============================================
    console.log('💼 Seeding recruiter experience...');

    await RecruiterExperience.findOrCreate({
      where: {
        recruiterId: recruiter1.id,
        companyName: 'Tech Corp',
        role: 'HR Manager'
      },
      defaults: {
        recruiterId: recruiter1.id,
        companyName: 'Tech Corp',
        role: 'HR Manager',
        fromDate: new Date('2020-01-01'),
        toDate: null,
        isCurrent: true
      }
    });

    await RecruiterExperience.findOrCreate({
      where: {
        recruiterId: recruiter2.id,
        companyName: 'Innovate Solutions',
        role: 'Talent Acquisition Lead'
      },
      defaults: {
        recruiterId: recruiter2.id,
        companyName: 'Innovate Solutions',
        role: 'Talent Acquisition Lead',
        fromDate: new Date('2019-06-01'),
        toDate: null,
        isCurrent: true
      }
    });

    // ============================================
    // 8. SEED RECRUITER SKILLS
    // ============================================
    console.log('🛠️  Seeding recruiter skills...');

    const recruiter1Skills = ['Talent Acquisition', 'HR Management', 'Recruitment', 'Interviewing', 'ATS'];
    for (const skillName of recruiter1Skills) {
      await RecruiterSkill.findOrCreate({
        where: {
          recruiterId: recruiter1.id,
          name: skillName
        },
        defaults: {
          recruiterId: recruiter1.id,
          name: skillName
        }
      });
    }

    const recruiter2Skills = ['Talent Sourcing', 'Candidate Screening', 'Recruitment Strategy', 'HR Analytics'];
    for (const skillName of recruiter2Skills) {
      await RecruiterSkill.findOrCreate({
        where: {
          recruiterId: recruiter2.id,
          name: skillName
        },
        defaults: {
          recruiterId: recruiter2.id,
          name: skillName
        }
      });
    }

    // ============================================
    // 9. SEED JOBS
    // ============================================
    console.log('💼 Seeding jobs...');

    const jobsData = [
      {
        title: 'Senior Full Stack Developer',
        companyName: 'Tech Corp',
        location: 'Seattle, USA',
        jobType: 'Full-time',
        workMode: 'Hybrid',
        experienceLevel: '3-5 years',
        salaryMin: 100000,
        salaryMax: 150000,
        salaryCurrency: 'USD',
        description: 'We are looking for an experienced Full Stack Developer to join our team. You will work on both frontend and backend systems, building scalable applications.',
        requirements: '• 3-5 years of full-stack development experience\n• Strong knowledge of React and Node.js\n• Experience with PostgreSQL\n• Understanding of RESTful APIs\n• Good problem-solving skills',
        benefits: '• Competitive salary and benefits package\n• Health, dental, and vision insurance\n• Flexible working hours\n• Remote work options\n• Professional development opportunities',
        skills: ['React', 'Node.js', 'PostgreSQL', 'JavaScript', 'TypeScript'],
        recruiterId: recruiter1.id
      },
      {
        title: 'Frontend Developer',
        companyName: 'Innovate Solutions',
        location: 'Boston, USA',
        jobType: 'Full-time',
        workMode: 'Remote',
        experienceLevel: '1-3 years',
        salaryMin: 70000,
        salaryMax: 100000,
        salaryCurrency: 'USD',
        description: 'Join our team as a Frontend Developer and help build beautiful user interfaces. You will work with modern frameworks and tools.',
        requirements: '• 1-3 years of frontend development experience\n• Proficiency in React and JavaScript\n• Experience with responsive design\n• Knowledge of modern frontend tools',
        benefits: '• Fully remote work\n• Competitive salary\n• Health insurance\n• Flexible PTO\n• Learning budget',
        skills: ['React', 'JavaScript', 'CSS', 'HTML', 'TypeScript'],
        recruiterId: recruiter2.id
      },
      {
        title: 'Backend Developer',
        companyName: 'Tech Corp',
        location: 'Seattle, USA',
        jobType: 'Full-time',
        workMode: 'On-site',
        experienceLevel: '2-4 years',
        salaryMin: 90000,
        salaryMax: 130000,
        salaryCurrency: 'USD',
        description: 'We need a Backend Developer to build robust APIs and services. Work on high-performance systems.',
        requirements: '• 2-4 years of backend development experience\n• Strong knowledge of Node.js or Python\n• Experience with databases\n• Understanding of microservices',
        benefits: '• Competitive salary\n• Health and dental insurance\n• 401(k) matching\n• On-site perks\n• Professional development',
        skills: ['Node.js', 'PostgreSQL', 'Express.js', 'RESTful APIs', 'Docker'],
        recruiterId: recruiter1.id
      },
      {
        title: 'Software Engineer Intern',
        companyName: 'Innovate Solutions',
        location: 'Boston, USA',
        jobType: 'Internship',
        workMode: 'Hybrid',
        experienceLevel: '0-1 years',
        salaryMin: 30000,
        salaryMax: 40000,
        salaryCurrency: 'USD',
        description: 'Perfect opportunity for students or recent graduates to gain hands-on experience in software development.',
        requirements: '• Currently pursuing or recently completed a degree in Computer Science\n• Basic knowledge of programming languages\n• Eagerness to learn and grow',
        benefits: '• Mentorship from senior developers\n• Networking opportunities\n• Potential for full-time conversion\n• Flexible schedule',
        skills: ['JavaScript', 'Python', 'Git', 'HTML', 'CSS'],
        recruiterId: recruiter2.id
      }
    ];

    const createdJobs = [];
    for (const jobData of jobsData) {
      const { skills, ...jobFields } = jobData;
      
      const [job, created] = await Job.findOrCreate({
        where: {
          title: jobFields.title,
          companyName: jobFields.companyName,
          recruiterId: jobFields.recruiterId
        },
        defaults: {
          ...jobFields,
          isActive: true
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
    // 10. SEED JOB APPLICATIONS
    // ============================================
    console.log('📄 Seeding job applications...');

    // Candidate 1 applies to multiple jobs
    await JobApplication.findOrCreate({
      where: {
        jobId: createdJobs[0].id,
        candidateId: candidate1.id
      },
      defaults: {
        jobId: createdJobs[0].id,
        candidateId: candidate1.id,
        status: 'Under Review',
        resumeUrl: '/uploads/resumes/sample-resume-1.pdf',
        coverLetter: 'I am very interested in this position and believe my experience aligns well with your requirements.',
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      }
    });

    await JobApplication.findOrCreate({
      where: {
        jobId: createdJobs[1].id,
        candidateId: candidate1.id
      },
      defaults: {
        jobId: createdJobs[1].id,
        candidateId: candidate1.id,
        status: 'Interview',
        resumeUrl: '/uploads/resumes/sample-resume-1.pdf',
        coverLetter: 'I would love to contribute to your team.',
        appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      }
    });

    await JobApplication.findOrCreate({
      where: {
        jobId: createdJobs[2].id,
        candidateId: candidate1.id
      },
      defaults: {
        jobId: createdJobs[2].id,
        candidateId: candidate1.id,
        status: 'Applied',
        resumeUrl: '/uploads/resumes/sample-resume-1.pdf',
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    });

    // Candidate 2 applies to jobs
    await JobApplication.findOrCreate({
      where: {
        jobId: createdJobs[1].id,
        candidateId: candidate2.id
      },
      defaults: {
        jobId: createdJobs[1].id,
        candidateId: candidate2.id,
        status: 'Applied',
        resumeUrl: '/uploads/resumes/sample-resume-2.pdf',
        appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    });

    await JobApplication.findOrCreate({
      where: {
        jobId: createdJobs[3].id,
        candidateId: candidate2.id
      },
      defaults: {
        jobId: createdJobs[3].id,
        candidateId: candidate2.id,
        status: 'Under Review',
        resumeUrl: '/uploads/resumes/sample-resume-2.pdf',
        coverLetter: 'As a recent graduate, I am excited about this opportunity.',
        appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      }
    });

    // ============================================
    // 11. SEED INTERVIEWS
    // ============================================
    console.log('📅 Seeding interviews...');

    // Get application for interview
    const interviewApplication = await JobApplication.findOne({
      where: {
        candidateId: candidate1.id,
        status: 'Interview'
      }
    });

    if (interviewApplication) {
      await Interview.findOrCreate({
        where: {
          recruiterId: recruiter2.id,
          jobId: interviewApplication.jobId,
          candidateId: candidate1.id
        },
        defaults: {
          recruiterId: recruiter2.id,
          jobId: interviewApplication.jobId,
          candidateId: candidate1.id,
          interviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          interviewTime: '14:00',
          mode: 'Online',
          status: 'Scheduled',
          notes: 'Technical interview focusing on React and Node.js skills.',
          meetingLink: 'https://meet.google.com/abc-defg-hij'
        }
      });
    }

    // Create another interview for candidate 2
    const candidate2Application = await JobApplication.findOne({
      where: {
        candidateId: candidate2.id,
        jobId: createdJobs[1].id
      }
    });

    if (candidate2Application) {
      await Interview.findOrCreate({
        where: {
          recruiterId: recruiter2.id,
          jobId: candidate2Application.jobId,
          candidateId: candidate2.id
        },
        defaults: {
          recruiterId: recruiter2.id,
          jobId: candidate2Application.jobId,
          candidateId: candidate2.id,
          interviewDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          interviewTime: '10:00',
          mode: 'Offline',
          status: 'Scheduled',
          notes: 'Initial screening interview.',
          location: 'Innovate Solutions Office, 123 Main St, Boston, MA'
        }
      });
    }

    // ============================================
    // 12. SEED SAVED JOBS
    // ============================================
    console.log('⭐ Seeding saved jobs...');

    await SavedJob.findOrCreate({
      where: {
        jobId: createdJobs[0].id,
        candidateId: candidate1.id
      },
      defaults: {
        jobId: createdJobs[0].id,
        candidateId: candidate1.id
      }
    });

    await SavedJob.findOrCreate({
      where: {
        jobId: createdJobs[2].id,
        candidateId: candidate1.id
      },
      defaults: {
        jobId: createdJobs[2].id,
        candidateId: candidate1.id
      }
    });

    await SavedJob.findOrCreate({
      where: {
        jobId: createdJobs[1].id,
        candidateId: candidate2.id
      },
      defaults: {
        jobId: createdJobs[1].id,
        candidateId: candidate2.id
      }
    });

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n✅ Seeding completed successfully!\n');
    console.log('📊 Seeding Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 Users: 8 (6 candidates, 2 recruiters)');
    console.log('👤 Candidates: 6');
    console.log('🏢 Recruiters: 2');
    console.log('🎓 Education Records: 8');
    console.log('💼 Experience Records: 7');
    console.log('🛠️  Candidate Skills: 40+');
    console.log('💼 Recruiter Experience: 2');
    console.log('🛠️  Recruiter Skills: 9');
    console.log('💼 Jobs: 4');
    console.log('📄 Job Applications: 5');
    console.log('📅 Interviews: 2');
    console.log('⭐ Saved Jobs: 3');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔑 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('CANDIDATES:');
    console.log('  • candidate1@test.com / password123 (John Doe - Experienced)');
    console.log('  • candidate2@test.com / password123 (Jane Smith - Fresher)');
    console.log('  • candidate3@test.com / password123 (Michael Chen - Experienced)');
    console.log('  • candidate4@test.com / password123 (Sarah Johnson - Experienced)');
    console.log('  • candidate5@test.com / password123 (David Brown - Fresher)');
    console.log('  • candidate6@test.com / password123 (Emily Davis - Experienced)');
    console.log('');
    console.log('RECRUITERS:');
    console.log('  • recruiter1@test.com / password123 (Alice Johnson - Tech Corp)');
    console.log('  • recruiter2@test.com / password123 (Bob Williams - Innovate Solutions)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      users: 8,
      candidates: 6,
      recruiters: 2,
      jobs: 4
    };
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    restoreFindOrCreate();
  }
};

module.exports = seedAll;

if (require.main === module) {
  seedAll()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

