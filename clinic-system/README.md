# Family Medium Clinic System (FMCS)

## Overview
The Family Medium Clinic System (FMCS) is a comprehensive, production-ready clinic management system designed to handle patient care, laboratory workflows, financial billing, and regulatory reporting. Built with modern technologies and best practices, FMCS provides a complete solution for medium-sized healthcare facilities.

## Key Features

### Core Modules
- **Patient Management**: Complete demographic records, medical history, next-of-kin information
- **Appointment Scheduling**: Calendar-based booking with status tracking
- **Electronic Medical Records (EMR)**: Clinical documentation with ICD-11 coding
- **Laboratory Information System (LIS)**: Full workflow from request to finalization
- **Reproductive Maternal Neonatal Child Health (RMNCH)**: Antenatal, postnatal, immunization, growth monitoring
- **Medical Certificates**: Fitness, Sick-Leave, Disability, and Report certificates with QR verification
- **Billing & Invoicing**: Multi-payment methods, partial payments, tax calculations
- **HMIS Reporting**: Regulatory compliance reports, disease surveillance, financial analytics

### Advanced Features
- **Clinical Decision Support**: Common symptoms catalog with suggested investigations
- **Drug Catalog**: Essential medicines with pregnancy/lactation safety categories
- **Auto-Abnormal Flagging**: Lab results automatically flagged based on reference ranges
- **QR Code Verification**: All printed documents include scannable QR codes
- **Role-Based Access Control**: Admin, Doctor, LabTech, Receptionist roles
- **PDF Generation**: Professional certificates, lab results, and prescriptions

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB 7 with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, bcryptjs, express-validator

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **State Management**: Context API
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Charts**: Recharts
- **PDF**: jsPDF

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database**: MongoDB 7
- **Web Server**: Nginx (for frontend)

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- OR Node.js 18+, npm 9+, MongoDB 7

### Using Docker (Recommended)

```bash
# Clone the repository
cd clinic-system

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MongoDB: localhost:27017
```

### Manual Installation

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Seed database
npm run seed

# Start development server
npm run dev
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fmcs.com | Admin123! |
| Doctor | dr.eeyob@fmcs.com | Doctor123! |
| Lab Tech | lab.tech@fmcs.com | LabTech123! |
| Receptionist | receptionist@fmcs.com | Recept123! |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/change-password` - Change password

### Patients
- `GET /api/patients` - List all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Book appointment
- `PUT /api/appointments/:id/status` - Update status

### Laboratory
- `GET /api/lab-requests` - List lab requests
- `POST /api/lab-requests` - Create lab request
- `PUT /api/lab-requests/:id/results` - Enter results
- `PUT /api/lab-requests/:id/verify` - Verify results
- `GET /api/lab-requests/:id/pdf` - Download PDF
- `GET /api/lab-catalog` - List available tests

### Medical Records
- `GET /api/records` - List medical records
- `POST /api/records` - Create new record
- `GET /api/records/:id` - Get record details

### Certificates
- `GET /api/certificates` - List certificates
- `POST /api/certificates` - Issue certificate
- `PUT /api/certificates/:id/revoke` - Revoke certificate
- `GET /api/certificates/:id/pdf` - Download PDF

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id/payment` - Record payment
- `GET /api/invoices/:id/pdf` - Download receipt

### Reports
- `GET /api/reports/hmis/daily` - Daily summary
- `GET /api/reports/hmis/monthly` - Monthly report
- `GET /api/reports/hmis/disease-surveillance` - Top diagnoses

### Reference Data
- `GET /api/icd11` - Search ICD-11 codes
- `GET /api/symptoms` - List common symptoms
- `GET /api/drugs` - List available drugs

## Database Models

### Core Models
- **User**: Authentication and role management
- **Patient**: Demographics and medical history
- **Doctor**: Specialization and license info
- **Appointment**: Scheduling and status
- **MedicalRecord**: Clinical documentation
- **LabRequest**: Laboratory workflow
- **LabTestCatalog**: Test definitions
- **MedicalCertificate**: Certificate issuance
- **Invoice**: Billing and payments
- **HMISReport**: Aggregated statistics
- **RMNCHService**: Maternal and child health
- **SymptomCatalog**: Common symptoms
- **DrugCatalog**: Medication database
- **ICD11Code**: Diagnostic codes

## Project Structure

```
clinic-system/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, validation
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API endpoints
│   │   ├── scripts/        # Seeder scripts
│   │   ├── services/       # PDF generation, etc.
│   │   ├── data/           # Static JSON data
│   │   └── server.js       # Entry point
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context
│   │   ├── pages/          # Page components
│   │   ├── styles/         # CSS/Tailwind
│   │   ├── utils/          # Helpers, API client
│   │   └── App.jsx         # Main app component
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── init.sql
├── deploy.sh
├── backup.sh
├── restore.sh
└── README.md
```

## Security Features

- JWT-based authentication with configurable expiration
- Password hashing using bcryptjs
- Role-based access control (RBAC)
- Input validation with express-validator
- CORS protection
- Helmet security headers
- Request compression
- Morgan logging

## Data Seeding

The system comes pre-seeded with:
- 6 users (Admin, 3 Doctors, Lab Tech, Receptionist)
- 5 sample patients
- 60+ laboratory tests across 6 categories
- 15 essential medications
- 15 common symptoms with red flags
- 300+ ICD-11 diagnostic codes covering all 26 chapters

Run seeding manually:
```bash
cd backend
npm run seed
```

## Backup & Restore

### Backup Database
```bash
./backup.sh
# Creates timestamped backup in backups/ directory
```

### Restore Database
```bash
./restore.sh backups/fmcs-backup-YYYYMMDD-HHMMSS.bson
```

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production deployment instructions including:
- Server requirements
- Environment configuration
- SSL/TLS setup
- Reverse proxy configuration
- Monitoring and logging

## Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Local setup guide
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production deployment
- [FEATURES_COMPLETE.md](./FEATURES_COMPLETE.md) - Detailed feature list

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Support

For issues, questions, or contributions, please contact the development team.

---

**Family Medium Clinic System** - Empowering Healthcare Through Technology
