# AI powered Hiring Platform

An all-in-one hiring platform for Candidates and Recruiters built with Node.js, Express, PostgreSQL, Sequelize, React, and Tailwind CSS.

## Features

- **Authentication Module**
  - Common Sign In page for both roles
  - Role-specific Sign Up pages (Candidate & Recruiter)
  - JWT-based authentication
  - Password hashing with bcrypt

- **Candidate Questionnaire (4 Steps)**
  1. Tell us about yourself
  2. Add your education
  3. Tell us about your experience
  4. Upload your resume

- **Recruiter Questionnaire (4 Steps)**
  1. Tell us about your company
  2. Tell us about yourself
  3. Tell us about your experience
  4. Upload your company details

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Sequelize
- **Frontend**: React + Vite + Tailwind CSS (CDN)
- **Authentication**: JWT
- **Password Hashing**: bcrypt
- **File Uploads**: Multer

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install root dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

4. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

5. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Update the following values in `backend/.env`:
     - `DB_PASSWORD`: Your PostgreSQL password
     - `JWT_SECRET`: Generate a secure random string (e.g., `openssl rand -base64 32`)
     - `DB_USER`: Your PostgreSQL username (default: `postgres`)
     - `DB_HOST`: Your PostgreSQL host (default: `localhost`)
     - `DB_PORT`: Your PostgreSQL port (default: `5432`)

6. Create the PostgreSQL database:
   ```sql
   CREATE DATABASE fig_hiring_platform;
   ```

7. The database will be automatically synced when the backend server starts.

## Running the Application

### Development Mode

From the root directory, run:
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000) using Vite.

### Individual Services

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
# or
cd frontend && npm run dev
```

## Project Structure

```
fig-hiring-platform/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── candidateController.js
│   │   └── recruiterController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Candidate.js
│   │   ├── Recruiter.js
│   │   ├── Education.js
│   │   ├── Experience.js
│   │   ├── Skill.js
│   │   ├── RecruiterExperience.js
│   │   └── RecruiterSkill.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── candidateRoutes.js
│   │   └── recruiterRoutes.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── upload.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Sign up
- `POST /api/auth/signin` - Sign in
- `GET /api/auth/me` - Get current user

### Candidate
- `PUT /api/candidate/profile` - Update profile
- `POST /api/candidate/education` - Add education
- `GET /api/candidate/education` - Get educations
- `DELETE /api/candidate/education/:id` - Delete education
- `POST /api/candidate/experience` - Add experience
- `GET /api/candidate/experience` - Get experiences
- `DELETE /api/candidate/experience/:id` - Delete experience
- `POST /api/candidate/skill` - Add skill
- `GET /api/candidate/skill` - Get skills
- `DELETE /api/candidate/skill/:id` - Delete skill
- `POST /api/candidate/resume` - Upload resume
- `POST /api/candidate/complete-questionnaire` - Complete questionnaire

### Recruiter
- `PUT /api/recruiter/profile` - Update profile
- `PUT /api/recruiter/company` - Update company info
- `POST /api/recruiter/experience` - Add experience
- `GET /api/recruiter/experience` - Get experiences
- `DELETE /api/recruiter/experience/:id` - Delete experience
- `POST /api/recruiter/skill` - Add skill
- `GET /api/recruiter/skill` - Get skills
- `DELETE /api/recruiter/skill/:id` - Delete skill
- `POST /api/recruiter/documents` - Upload company documents
- `POST /api/recruiter/complete-questionnaire` - Complete questionnaire

## Database Schema

The database `fig_hiring_platform` includes the following tables:
- `users` - User accounts
- `candidates` - Candidate profiles
- `recruiters` - Recruiter profiles
- `educations` - Candidate education records
- `experiences` - Candidate work experiences
- `skills` - Candidate skills
- `recruiter_experiences` - Recruiter work experiences
- `recruiter_skills` - Recruiter skills

## File Uploads

Uploaded files are stored in the `backend/uploads/` directory:
- `resumes/` - Candidate resumes
- `company-logos/` - Company logos
- `business-proofs/` - Business proof documents

## License

ISC


