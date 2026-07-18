const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import models to initialize associations
require('./models');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files - must be before API routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath, stat) => {
    // Set proper headers for file downloads
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (ext === '.doc') {
      res.setHeader('Content-Type', 'application/msword');
    } else if (ext === '.docx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
    // Allow CORS for file access
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/candidate', require('./routes/candidateRoutes'));
app.use('/api/recruiter', require('./routes/recruiterRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
const { syncDatabase } = require('./models');
const seedAll = require('./seeders/seedAll');

// Sync database and start server
const startServer = async () => {
  try {
    // Sync database (create tables if they don't exist)
    await syncDatabase(false);

    const shouldSeedDemoData = process.env.AUTO_SEED_DEMO_DATA === 'true';
    if (shouldSeedDemoData) {
      await seedAll({ skipSync: true });
    }
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

