-- FMCS Database Initialization Script (SQL Reference Schema)
-- Note: This is a reference schema for MongoDB document structure
-- Actual implementation uses Mongoose schemas in backend/src/models/

-- Users Collection
CREATE TABLE users (
    _id VARCHAR(24) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Doctor', 'LabTech', 'Receptionist') NOT NULL,
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Patients Collection
CREATE TABLE patients (
    _id VARCHAR(24) PRIMARY KEY,
    mrn VARCHAR(20) UNIQUE NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    dateOfBirth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    nextOfKinName VARCHAR(100),
    nextOfKinPhone VARCHAR(20),
    medicalHistorySummary TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Appointments Collection
CREATE TABLE appointments (
    _id VARCHAR(24) PRIMARY KEY,
    patientId VARCHAR(24) REFERENCES patients(_id),
    doctorId VARCHAR(24) REFERENCES users(_id),
    appointmentDate DATETIME NOT NULL,
    reason TEXT,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Medical Records Collection
CREATE TABLE medical_records (
    _id VARCHAR(24) PRIMARY KEY,
    patientId VARCHAR(24) REFERENCES patients(_id),
    doctorId VARCHAR(24) REFERENCES users(_id),
    visitDate DATETIME NOT NULL,
    chiefComplaint TEXT,
    diagnosisCodes JSON, -- ICD-11 codes
    treatmentPlan TEXT,
    prescriptions JSON,
    vitalSigns JSON,
    clinicalNotes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Lab Requests Collection
CREATE TABLE lab_requests (
    _id VARCHAR(24) PRIMARY KEY,
    labId VARCHAR(30) UNIQUE NOT NULL, -- LAB-YYYYMMDD-XXXX
    patientId VARCHAR(24) REFERENCES patients(_id),
    doctorId VARCHAR(24) REFERENCES users(_id),
    tests JSON NOT NULL, -- Array of test objects
    priority ENUM('routine', 'urgent', 'stat') DEFAULT 'routine',
    status ENUM('Requested', 'Sample Collected', 'Result Entered', 'Verified', 'Finalized', 'Cancelled') DEFAULT 'Requested',
    results JSON,
    verifiedBy VARCHAR(24) REFERENCES users(_id),
    finalizedAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Lab Test Catalog Collection
CREATE TABLE lab_test_catalog (
    _id VARCHAR(24) PRIMARY KEY,
    testName VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20),
    referenceRangeMin DECIMAL(10, 2),
    referenceRangeMax DECIMAL(10, 2),
    criticalLow DECIMAL(10, 2),
    criticalHigh DECIMAL(10, 2),
    specimenType VARCHAR(50),
    turnaroundTimeHours INT,
    isActive BOOLEAN DEFAULT true
);

-- Medical Certificates Collection
CREATE TABLE medical_certificates (
    _id VARCHAR(24) PRIMARY KEY,
    certificateId VARCHAR(30) UNIQUE NOT NULL, -- CERT-YYYYMMDD-XXXX
    patientId VARCHAR(24) REFERENCES patients(_id),
    doctorId VARCHAR(24) REFERENCES users(_id),
    type ENUM('Fitness', 'Sick-Leave', 'Disability', 'Report') NOT NULL,
    issueDate DATE NOT NULL,
    validFrom DATE,
    validUntil DATE,
    diagnosis TEXT,
    recommendations TEXT,
    vitalSigns JSON,
    clinicalExamination TEXT,
    labInvestigations JSON,
    isRevoked BOOLEAN DEFAULT false,
    revocationReason TEXT,
    printCount INT DEFAULT 0,
    qrCodeHash VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Invoices Collection
CREATE TABLE invoices (
    _id VARCHAR(24) PRIMARY KEY,
    invoiceNumber VARCHAR(30) UNIQUE NOT NULL, -- INV-YYYYMMDD-XXXX
    patientId VARCHAR(24) REFERENCES patients(_id),
    items JSON NOT NULL, -- Array of line items
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    amountPaid DECIMAL(10, 2) DEFAULT 0,
    balanceDue DECIMAL(10, 2) NOT NULL,
    paymentMethod ENUM('Cash', 'Card', 'Insurance', 'Bank Transfer', 'Mobile Money'),
    status ENUM('Pending', 'Partial', 'Paid') DEFAULT 'Pending',
    payments JSON, -- Array of payment records
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- RMNCH Services Collection
CREATE TABLE rmnch_services (
    _id VARCHAR(24) PRIMARY KEY,
    patientId VARCHAR(24) REFERENCES patients(_id),
    serviceType ENUM('Antenatal', 'Postnatal', 'Immunization', 'Growth Monitoring', 'Family Planning', 'Newborn Care') NOT NULL,
    serviceDate DATE NOT NULL,
    gestationalAgeWeeks INT, -- For antenatal
    deliveryDetails JSON, -- For postnatal
    immunizationData JSON, -- For immunization
    growthMeasurements JSON, -- For growth monitoring
    familyPlanningMethod VARCHAR(100), -- For family planning
    apgarScores JSON, -- For newborn care
    notes TEXT,
    nextVisitDate DATE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HMIS Reports Collection
CREATE TABLE hmis_reports (
    _id VARCHAR(24) PRIMARY KEY,
    reportType ENUM('Daily', 'Monthly', 'Disease Surveillance') NOT NULL,
    reportPeriodStart DATE NOT NULL,
    reportPeriodEnd DATE NOT NULL,
    data JSON NOT NULL, -- Aggregated statistics
    generatedBy VARCHAR(24) REFERENCES users(_id),
    exportedFormats JSON, -- ['CSV', 'PDF', etc.]
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_appointments_date ON appointments(appointmentDate);
CREATE INDEX idx_lab_requests_status ON lab_requests(status);
CREATE INDEX idx_certificates_type ON medical_certificates(type);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
