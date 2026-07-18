const { Job, JobSkill, Recruiter, User } = require('../models');

const seedJobs = async () => {
  try {
    console.log('Starting job seeding...');

    // Find or create a recruiter user for seeding
    let recruiterUser = await User.findOne({ where: { role: 'recruiter' } });
    
    if (!recruiterUser) {
      // Create a recruiter user for seeding
      recruiterUser = await User.create({
        email: 'recruiter@example.com',
        password: '$2b$10$rQZ8KJZ8KJZ8KJZ8KJZ8Ku', // Hashed password (you can use bcrypt.hashSync('password', 10))
        role: 'recruiter',
        isActive: true,
        isVerified: true
      });
    }

    let recruiter = await Recruiter.findOne({ where: { userId: recruiterUser.id } });
    
    if (!recruiter) {
      recruiter = await Recruiter.create({
        userId: recruiterUser.id,
        fullName: 'John Recruiter',
        companyName: 'TechCorp Inc.',
        companyWebsite: 'https://techcorp.com',
        industryType: 'Technology',
        companySize: '100-500',
        headquartersLocation: 'San Francisco, CA',
        questionnaireCompleted: true
      });
    }

    // Sample jobs data
    const jobsData = [
      {
        title: 'MERN Stack Developer',
        companyName: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        jobType: 'Full-time',
        workMode: 'Hybrid',
        experienceLevel: '1-3 years',
        salaryMin: 80000,
        salaryMax: 120000,
        salaryCurrency: 'USD',
        description: 'Join our dynamic team as a MERN Stack Developer and help build cutting-edge web applications. You will work on exciting projects using MongoDB, Express.js, React, and Node.js. We are looking for a passionate developer who loves to code and is eager to learn new technologies.',
        requirements: '• 1-3 years of experience with MERN stack\n• Strong knowledge of JavaScript, React, and Node.js\n• Experience with MongoDB and Express.js\n• Understanding of RESTful APIs\n• Good problem-solving skills\n• Bachelor\'s degree in Computer Science or related field',
        benefits: '• Competitive salary and benefits package\n• Health, dental, and vision insurance\n• Flexible working hours\n• Remote work options\n• Professional development opportunities\n• Stock options',
        skills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript']
      },
      {
        title: 'Frontend Developer',
        companyName: 'StartupXYZ',
        location: 'New York, NY',
        jobType: 'Full-time',
        workMode: 'Remote',
        experienceLevel: '1-3 years',
        salaryMin: 70000,
        salaryMax: 100000,
        salaryCurrency: 'USD',
        description: 'We are seeking a talented Frontend Developer to join our growing team. You will be responsible for building user-friendly web interfaces and ensuring a great user experience across all devices.',
        requirements: '• 1-3 years of frontend development experience\n• Proficiency in React, JavaScript, and CSS\n• Experience with responsive design\n• Knowledge of modern frontend tools and frameworks\n• Strong attention to detail',
        benefits: '• Fully remote work\n• Competitive salary\n• Health insurance\n• Flexible PTO\n• Learning budget',
        skills: ['React', 'JavaScript', 'CSS', 'HTML', 'TypeScript']
      },
      {
        title: 'Software Development Intern',
        companyName: 'InnovateLab',
        location: 'Seattle, WA',
        jobType: 'Internship',
        workMode: 'Hybrid',
        experienceLevel: '0-1 years',
        salaryMin: 30000,
        salaryMax: 40000,
        salaryCurrency: 'USD',
        description: 'Perfect opportunity for students or recent graduates to gain hands-on experience in software development. Work alongside experienced developers on real-world projects.',
        requirements: '• Currently pursuing or recently completed a degree in Computer Science\n• Basic knowledge of programming languages\n• Eagerness to learn and grow\n• Good communication skills',
        benefits: '• Mentorship from senior developers\n• Networking opportunities\n• Potential for full-time conversion\n• Flexible schedule',
        skills: ['JavaScript', 'Python', 'Git', 'HTML']
      },
      {
        title: 'Full Stack Engineer',
        companyName: 'DataFlow Systems',
        location: 'Austin, TX',
        jobType: 'Full-time',
        workMode: 'On-site',
        experienceLevel: '3-5 years',
        salaryMin: 90000,
        salaryMax: 130000,
        salaryCurrency: 'USD',
        description: 'We are looking for an experienced Full Stack Engineer to join our team. You will work on both frontend and backend systems, building scalable applications that handle large amounts of data.',
        requirements: '• 3-5 years of full-stack development experience\n• Strong knowledge of Python and Django\n• Experience with React and modern frontend frameworks\n• Understanding of database design and optimization\n• Experience with cloud platforms (AWS, Azure, or GCP)',
        benefits: '• Competitive salary and equity\n• Comprehensive health benefits\n• 401(k) matching\n• On-site gym and cafeteria\n• Professional development budget',
        skills: ['Python', 'Django', 'React', 'PostgreSQL', 'AWS']
      },
      {
        title: 'Senior Backend Developer',
        companyName: 'CloudTech Solutions',
        location: 'San Francisco, CA',
        jobType: 'Full-time',
        workMode: 'Remote',
        experienceLevel: '5+ years',
        salaryMin: 130000,
        salaryMax: 180000,
        salaryCurrency: 'USD',
        description: 'Lead backend development efforts for our cloud-based platform. Work on high-performance systems that serve millions of users.',
        requirements: '• 5+ years of backend development experience\n• Expertise in Node.js, Python, or Java\n• Experience with microservices architecture\n• Strong knowledge of database systems\n• Experience with cloud infrastructure',
        benefits: '• Top-tier salary and equity\n• Comprehensive benefits\n• Unlimited PTO\n• Remote work flexibility\n• Annual tech budget',
        skills: ['Node.js', 'Python', 'PostgreSQL', 'Docker', 'Kubernetes']
      },
      {
        title: 'React Native Developer',
        companyName: 'MobileFirst Inc.',
        location: 'New York, NY',
        jobType: 'Full-time',
        workMode: 'Hybrid',
        experienceLevel: '2-4 years',
        salaryMin: 85000,
        salaryMax: 115000,
        salaryCurrency: 'USD',
        description: 'Build amazing mobile applications using React Native. Work on both iOS and Android platforms with a single codebase.',
        requirements: '• 2-4 years of React Native experience\n• Strong knowledge of React and JavaScript\n• Experience with mobile app deployment\n• Understanding of native mobile development\n• Portfolio of published apps',
        benefits: '• Competitive salary\n• Health and dental insurance\n• Flexible work schedule\n• Mobile device budget\n• Conference attendance',
        skills: ['React Native', 'React', 'JavaScript', 'iOS', 'Android']
      },
      {
        title: 'DevOps Engineer',
        companyName: 'InfraScale',
        location: 'Seattle, WA',
        jobType: 'Full-time',
        workMode: 'Remote',
        experienceLevel: '3-5 years',
        salaryMin: 100000,
        salaryMax: 140000,
        salaryCurrency: 'USD',
        description: 'Manage and optimize our cloud infrastructure. Ensure high availability and performance of our systems.',
        requirements: '• 3-5 years of DevOps experience\n• Strong knowledge of AWS, Azure, or GCP\n• Experience with CI/CD pipelines\n• Knowledge of containerization (Docker, Kubernetes)\n• Scripting skills (Bash, Python)',
        benefits: '• Competitive salary\n• Full remote work\n• Health insurance\n• Learning budget\n• Equipment provided',
        skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform']
      },
      {
        title: 'UI/UX Designer',
        companyName: 'DesignStudio',
        location: 'Austin, TX',
        jobType: 'Full-time',
        workMode: 'Hybrid',
        experienceLevel: '2-4 years',
        salaryMin: 70000,
        salaryMax: 95000,
        salaryCurrency: 'USD',
        description: 'Create beautiful and intuitive user interfaces. Work closely with developers to bring designs to life.',
        requirements: '• 2-4 years of UI/UX design experience\n• Proficiency in Figma, Sketch, or Adobe XD\n• Strong portfolio\n• Understanding of user research\n• Knowledge of frontend development basics',
        benefits: '• Competitive salary\n• Health benefits\n• Design software budget\n• Flexible schedule\n• Creative freedom',
        skills: ['Figma', 'UI/UX', 'User Research', 'Prototyping', 'Design Systems']
      },
      {
        title: 'Data Engineer',
        companyName: 'DataVault',
        location: 'San Francisco, CA',
        jobType: 'Full-time',
        workMode: 'On-site',
        experienceLevel: '3-5 years',
        salaryMin: 110000,
        salaryMax: 150000,
        salaryCurrency: 'USD',
        description: 'Build and maintain data pipelines. Work with large datasets and ensure data quality and reliability.',
        requirements: '• 3-5 years of data engineering experience\n• Strong knowledge of Python and SQL\n• Experience with data warehouses (Snowflake, BigQuery)\n• Knowledge of ETL processes\n• Experience with Apache Spark or similar',
        benefits: '• Competitive salary\n• Health and dental insurance\n• 401(k) matching\n• Professional development\n• On-site perks',
        skills: ['Python', 'SQL', 'Apache Spark', 'Snowflake', 'ETL']
      },
      {
        title: 'QA Engineer',
        companyName: 'QualityAssurance Pro',
        location: 'New York, NY',
        jobType: 'Full-time',
        workMode: 'Hybrid',
        experienceLevel: '2-4 years',
        salaryMin: 75000,
        salaryMax: 100000,
        salaryCurrency: 'USD',
        description: 'Ensure the quality of our software products. Write test cases and automate testing processes.',
        requirements: '• 2-4 years of QA experience\n• Knowledge of testing methodologies\n• Experience with test automation tools\n• Strong attention to detail\n• Good communication skills',
        benefits: '• Competitive salary\n• Health insurance\n• Flexible schedule\n• Learning opportunities\n• Team events',
        skills: ['Selenium', 'Jest', 'Cypress', 'Test Automation', 'QA']
      },
      {
        title: 'Product Manager',
        companyName: 'ProductVision',
        location: 'Seattle, WA',
        jobType: 'Full-time',
        workMode: 'Remote',
        experienceLevel: '3-5 years',
        salaryMin: 100000,
        salaryMax: 140000,
        salaryCurrency: 'USD',
        description: 'Lead product development from conception to launch. Work with cross-functional teams to deliver great products.',
        requirements: '• 3-5 years of product management experience\n• Strong analytical skills\n• Excellent communication\n• Experience with agile methodologies\n• Technical background preferred',
        benefits: '• Competitive salary and equity\n• Full remote work\n• Health benefits\n• Professional development\n• Flexible PTO',
        skills: ['Product Management', 'Agile', 'Analytics', 'Strategy', 'Roadmapping']
      },
      {
        title: 'Machine Learning Engineer',
        companyName: 'AI Innovations',
        location: 'San Francisco, CA',
        jobType: 'Full-time',
        workMode: 'Hybrid',
        experienceLevel: '2-4 years',
        salaryMin: 120000,
        salaryMax: 160000,
        salaryCurrency: 'USD',
        description: 'Develop and deploy machine learning models. Work on cutting-edge AI projects.',
        requirements: '• 2-4 years of ML engineering experience\n• Strong knowledge of Python and ML frameworks\n• Experience with TensorFlow or PyTorch\n• Understanding of ML algorithms\n• Experience with model deployment',
        benefits: '• Top-tier salary and equity\n• Health and dental insurance\n• Research budget\n• Conference attendance\n• Flexible schedule',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning']
      }
    ];

    // Create jobs
    for (const jobData of jobsData) {
      const { skills, ...jobFields } = jobData;
      
      const [job, created] = await Job.findOrCreate({
        where: {
          title: jobFields.title,
          companyName: jobFields.companyName,
          recruiterId: recruiter.id
        },
        defaults: {
          ...jobFields,
          recruiterId: recruiter.id,
          isActive: true
        }
      });

      if (created || !(await JobSkill.count({ where: { jobId: job.id } }))) {
        // Clear existing skills if job already existed
        await JobSkill.destroy({ where: { jobId: job.id } });
        
        // Create skills
        for (const skillName of skills) {
          await JobSkill.create({
            jobId: job.id,
            skillName
          });
        }
      }
    }

    console.log(`Successfully seeded ${jobsData.length} jobs`);
  } catch (error) {
    console.error('Error seeding jobs:', error);
    throw error;
  }
};

module.exports = seedJobs;

