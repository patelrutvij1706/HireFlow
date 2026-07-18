const { Sequelize } = require('sequelize');
const { newDb } = require('pg-mem');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from the backend directory
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const useInMemoryDb = process.env.USE_IN_MEMORY_DB === 'true';

// Ensure password is always a string
let dbPassword = '';
if (process.env.DB_PASSWORD !== undefined && process.env.DB_PASSWORD !== null) {
  dbPassword = String(process.env.DB_PASSWORD);
}

if (process.env.NODE_ENV === 'development' && !process.env.DB_PASSWORD && !useInMemoryDb) {
  console.warn('Warning: DB_PASSWORD is not set in .env file. Using empty password.');
}

const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

let sequelize;

if (useInMemoryDb) {
  const inMemoryDb = newDb({
    autoCreateForeignKeyIndices: true
  });
  const pgMem = inMemoryDb.adapters.createPg();

  sequelize = new Sequelize(
    process.env.DB_NAME || 'fig_hiring_platform',
    process.env.DB_USER || 'postgres',
    dbPassword,
    {
      ...baseConfig,
      dialectModule: pgMem
    }
  );
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'fig_hiring_platform',
    process.env.DB_USER || 'postgres',
    dbPassword,
    baseConfig
  );
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    if (useInMemoryDb) {
      console.log('In-memory PostgreSQL connection has been established successfully.');
    } else {
      console.log('Database connection has been established successfully.');
    }
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = { sequelize, testConnection };
