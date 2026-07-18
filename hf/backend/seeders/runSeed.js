require('dotenv').config();
const { syncDatabase } = require('../models');
const seedJobs = require('./seedJobs');
const seedComplete = require('./seedComplete');

// Check command line arguments
const seedType = process.argv[2] || 'complete';

const runSeed = async () => {
  try {
    if (seedType === 'complete') {
      // seedComplete runs its own sync and process.exit
      await seedComplete();
    } else if (seedType === 'jobs') {
      console.log('Connecting to database...');
      await syncDatabase(false);
      console.log('Starting jobs seed process...');
      await seedJobs();
      console.log('Seed process completed successfully!');
      process.exit(0);
    } else {
      console.error('Invalid seed type. Use "jobs" or "complete"');
      console.log('Usage: node runSeed.js [jobs|complete]');
      process.exit(1);
    }
  } catch (error) {
    console.error('Seed process failed:', error);
    process.exit(1);
  }
};

runSeed();

