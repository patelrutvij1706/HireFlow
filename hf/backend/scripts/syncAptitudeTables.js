const { sequelize } = require('../config/database');
const { AptitudeTest, AptitudeQuestion, TestSubmission } = require('../models');

async function syncTables() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    console.log('Syncing AptitudeTest table...');
    await AptitudeTest.sync({ alter: true });
    console.log('✓ AptitudeTest table synced');

    console.log('Syncing AptitudeQuestion table...');
    await AptitudeQuestion.sync({ alter: true });
    console.log('✓ AptitudeQuestion table synced');

    console.log('Syncing TestSubmission table...');
    await TestSubmission.sync({ alter: true });
    console.log('✓ TestSubmission table synced');

    console.log('\nAll tables synced successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing tables:', error);
    process.exit(1);
  }
}

syncTables();

