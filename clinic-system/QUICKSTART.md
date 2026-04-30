# QUICKSTART - Local Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

### Option 1: Docker (Recommended)
- Docker Desktop or Docker Engine 20+
- Docker Compose 2.0+

### Option 2: Manual Installation
- Node.js 18 or higher
- npm 9 or higher
- MongoDB 7 (local or cloud instance)
- Git

## Quick Start with Docker (5 minutes)

### Step 1: Clone and Navigate
```bash
cd clinic-system
```

### Step 2: Configure Environment
```bash
# Copy example environment file
cp backend/.env.example backend/.env

# Edit if needed (defaults work for local development)
nano backend/.env
```

### Step 3: Start All Services
```bash
docker-compose up --build
```

Wait for all services to start. You'll see logs from MongoDB, Backend, and Frontend.

### Step 4: Seed the Database
```bash
# In a new terminal
docker-compose exec backend npm run seed
```

### Step 5: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### Step 6: Login
Use one of the default credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fmcs.com | Admin123! |
| Doctor | dr.eeyob@fmcs.com | Doctor123! |
| Lab Tech | lab.tech@fmcs.com | LabTech123! |
| Receptionist | receptionist@fmcs.com | Recept123! |

## Manual Installation (Development)

### Backend Setup

#### Step 1: Install Dependencies
```bash
cd backend
npm install
```

#### Step 2: Configure Environment
```bash
cp .env.example .env
# Edit .env with your MongoDB connection string
```

Example `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fmcs
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

#### Step 3: Start MongoDB
```bash
# If using local MongoDB
mongod --dbpath /data/db

# Or use MongoDB Atlas cloud database
```

#### Step 4: Seed Database
```bash
npm run seed
```

You should see:
```
✓ Database seeded successfully
✓ Created 6 users
✓ Created 5 patients
✓ Created 60 lab tests
✓ Created 15 drugs
✓ Created 15 symptoms
✓ Created 300+ ICD-11 codes
```

#### Step 5: Start Backend Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Backend will be available at http://localhost:5000

### Frontend Setup

#### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

#### Step 2: Configure API URL
Create or edit `.env` in frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

#### Step 3: Start Development Server
```bash
npm run dev
```

Frontend will be available at http://localhost:5173 (or port shown in terminal)

## Verify Installation

### Test Backend API
```bash
curl http://localhost:5000/api/health
# Should return: {"status": "OK", "message": "FMCS API is running"}
```

### Test Database Connection
```bash
# Using mongosh
mongosh fmcs --eval "db.users.countDocuments()"
# Should return: 6
```

### Test Frontend
Open browser to http://localhost:3000 (Docker) or http://localhost:5173 (manual)
- You should see the login page
- Try logging in with default credentials

## Common Issues & Solutions

### Issue: Port Already in Use
```bash
# Check what's using the port
lsof -i :5000
lsof -i :3000
lsof -i :27017

# Kill the process
kill -9 <PID>

# Or change ports in docker-compose.yml
```

### Issue: MongoDB Connection Failed
```bash
# Check if MongoDB is running
docker-compose ps
# or
systemctl status mongod

# Verify connection string in .env
```

### Issue: Seed Script Fails
```bash
# Drop existing database first
docker-compose exec mongodb mongosh fmcs --eval "db.dropDatabase()"

# Then re-run seed
docker-compose exec backend npm run seed
```

### Issue: Frontend Can't Connect to Backend
```bash
# Check VITE_API_URL in frontend/.env
# Should be: VITE_API_URL=http://localhost:5000/api

# For Docker, ensure backend container is running
docker-compose ps backend
```

## Development Workflow

### Running Tests
```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Hot Reload
- **Backend**: Automatically restarts on code changes (nodemon)
- **Frontend**: Automatically refreshes browser on code changes (Vite HMR)

## Next Steps

1. **Explore the Dashboard** - Login and explore role-specific features
2. **Create a Patient** - Add patient demographics
3. **Book an Appointment** - Schedule a patient visit
4. **Create Medical Record** - Document a consultation with ICD-11 codes
5. **Order Lab Tests** - Request laboratory investigations
6. **Enter Lab Results** - Input results and see auto-flagging
7. **Generate Certificate** - Issue a medical certificate with QR code
8. **Create Invoice** - Bill for services rendered
9. **View Reports** - Check HMIS reports and analytics

## Stopping the System

### Docker
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

### Manual
```bash
# Press Ctrl+C in each terminal running the servers
```

## Getting Help

- Check [README.md](./README.md) for overview
- See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production setup
- Review [FEATURES_COMPLETE.md](./FEATURES_COMPLETE.md) for feature details

---

**Happy Coding!** 🏥💻
