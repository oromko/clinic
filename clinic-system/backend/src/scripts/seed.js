const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import Models
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const LabTestCatalog = require('../models/LabTestCatalog');
const ICD11Code = require('../models/ICD11Code');
const SymptomCatalog = require('../models/SymptomCatalog');
const DrugCatalog = require('../models/DrugCatalog');

// Import Data
const icd11Codes = require('../data/icd11_codes.json');
const labCatalog = require('../data/labCatalog.json');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fmcs_db';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

const seedUsers = async () => {
  console.log('\n📋 Seeding Users...');
  
  const hashedAdminPassword = await bcrypt.hash('Admin123!', 10);
  const hashedDoctorPassword = await bcrypt.hash('Doctor123!', 10);
  const hashedLabTechPassword = await bcrypt.hash('LabTech123!', 10);
  const hashedReceptionistPassword = await bcrypt.hash('Recept123!', 10);

  const users = [
    {
      email: 'admin@fmcs.com',
      password: hashedAdminPassword,
      name: 'System Administrator',
      role: 'Admin'
    },
    {
      email: 'dr.eeyob@fmcs.com',
      password: hashedDoctorPassword,
      name: 'Dr. Eeyob',
      role: 'Doctor'
    },
    {
      email: 'dr.sarah@fmcs.com',
      password: hashedDoctorPassword,
      name: 'Dr. Sarah Johnson',
      role: 'Doctor'
    },
    {
      email: 'dr.michael@fmcs.com',
      password: hashedDoctorPassword,
      name: 'Dr. Michael Chen',
      role: 'Doctor'
    },
    {
      email: 'lab.tech@fmcs.com',
      password: hashedLabTechPassword,
      name: 'Lab Technician',
      role: 'LabTech'
    },
    {
      email: 'receptionist@fmcs.com',
      password: hashedReceptionistPassword,
      name: 'Front Desk',
      role: 'Receptionist'
    }
  ];

  await User.deleteMany({});
  const createdUsers = await User.insertMany(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  
  // Create Doctor profiles for doctor users
  const doctors = createdUsers.filter(u => u.role === 'Doctor').map(u => ({
    userId: u._id,
    name: u.name,
    specialization: u.name.includes('Eeyob') ? 'General Practice' : u.name.includes('Sarah') ? 'Pediatrics' : 'Internal Medicine',
    licenseNumber: `LIC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    phone: '+251-9XX-XXX-XXX',
    email: u.email
  }));
  
  await Doctor.deleteMany({});
  const createdDoctors = await Doctor.insertMany(doctors);
  console.log(`✅ Created ${createdDoctors.length} doctor profiles`);
  
  return createdUsers;
};

const seedPatients = async () => {
  console.log('\n👥 Seeding Patients...');
  
  const patients = [
    {
      firstName: 'Abebe',
      lastName: 'Bikila',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'Male',
      phone: '+251-911-123456',
      email: 'abebe@example.com',
      address: 'Addis Ababa, Ethiopia',
      bloodGroup: 'O+',
      nextOfKin: {
        name: 'Kebede Bikila',
        relationship: 'Father',
        phone: '+251-912-234567'
      }
    },
    {
      firstName: 'Tigist',
      lastName: 'Mengistu',
      dateOfBirth: new Date('1985-08-22'),
      gender: 'Female',
      phone: '+251-922-345678',
      email: 'tigist@example.com',
      address: 'Addis Ababa, Ethiopia',
      bloodGroup: 'A+',
      nextOfKin: {
        name: 'Mengistu Tadesse',
        relationship: 'Spouse',
        phone: '+251-923-456789'
      }
    },
    {
      firstName: 'Yonas',
      lastName: 'Kinde',
      dateOfBirth: new Date('1978-12-10'),
      gender: 'Male',
      phone: '+251-933-567890',
      email: 'yonas@example.com',
      address: 'Adama, Ethiopia',
      bloodGroup: 'B+',
      nextOfKin: {
        name: 'Hiwot Kinde',
        relationship: 'Wife',
        phone: '+251-934-678901'
      }
    },
    {
      firstName: 'Hanna',
      lastName: 'Lemma',
      dateOfBirth: new Date('1995-03-05'),
      gender: 'Female',
      phone: '+251-944-789012',
      email: 'hanna@example.com',
      address: 'Bahir Dar, Ethiopia',
      bloodGroup: 'AB+',
      nextOfKin: {
        name: 'Lemma Dessalegn',
        relationship: 'Brother',
        phone: '+251-945-890123'
      }
    },
    {
      firstName: 'Dawit',
      lastName: 'Girma',
      dateOfBirth: new Date('2018-07-20'),
      gender: 'Male',
      phone: '+251-955-901234',
      email: 'dawit.parent@example.com',
      address: 'Hawassa, Ethiopia',
      bloodGroup: 'O-',
      nextOfKin: {
        name: 'Girma Bekele',
        relationship: 'Father',
        phone: '+251-956-012345'
      }
    }
  ];

  await Patient.deleteMany({});
  const createdPatients = await Patient.insertMany(patients);
  console.log(`✅ Created ${createdPatients.length} patients`);
  return createdPatients;
};

const seedLabCatalog = async () => {
  console.log('\n🔬 Seeding Lab Test Catalog...');
  
  await LabTestCatalog.deleteMany({});
  const tests = labCatalog.tests.map(test => ({
    testName: test.testName,
    category: test.category,
    code: test.code,
    description: test.description,
    specimenType: test.specimenType,
    referenceRange: {
      min: test.referenceMin,
      max: test.referenceMax,
      unit: test.unit
    },
    criticalValues: {
      low: test.criticalLow,
      high: test.criticalHigh
    },
    price: test.price,
    turnaroundTime: test.turnaroundTime
  }));
  
  const createdTests = await LabTestCatalog.insertMany(tests);
  console.log(`✅ Created ${createdTests.length} lab tests`);
  return createdTests;
};

const seedICD11Codes = async () => {
  console.log('\n🏥 Seeding ICD-11 Codes...');
  
  await ICD11Code.deleteMany({});
  const codes = icd11_codes.map(code => ({
    chapter: code.chapter,
    code: code.code,
    description: code.description
  }));
  
  const createdCodes = await ICD11Code.insertMany(codes);
  console.log(`✅ Created ${createdCodes.length} ICD-11 codes`);
  return createdCodes;
};

const seedSymptoms = async () => {
  console.log('\n🤒 Seeding Symptom Catalog...');
  
  const symptoms = [
    {
      symptom: 'Fever',
      category: 'General',
      commonCauses: ['Infection', 'Inflammation', 'Heat exhaustion'],
      redFlags: ['Temperature > 40°C', 'Persistent fever > 3 days', 'Associated rash', 'Neck stiffness'],
      suggestedInvestigations: ['CBC', 'Malaria test', 'Blood culture', 'Urinalysis'],
      suggestedTreatments: ['Paracetamol', 'Hydration', 'Rest']
    },
    {
      symptom: 'Headache',
      category: 'Neurological',
      commonCauses: ['Tension', 'Migraine', 'Sinusitis', 'Hypertension'],
      redFlags: ['Sudden severe headache', 'Associated vomiting', 'Visual disturbances', 'Neck stiffness'],
      suggestedInvestigations: ['BP measurement', 'Fundoscopy', 'CT head if indicated'],
      suggestedTreatments: ['Paracetamol', 'Ibuprofen', 'Rest in dark room']
    },
    {
      symptom: 'Cough',
      category: 'Respiratory',
      commonCauses: ['URI', 'Bronchitis', 'Pneumonia', 'TB', 'Asthma'],
      redFlags: ['Hemoptysis', 'Duration > 2 weeks', 'Night sweats', 'Weight loss'],
      suggestedInvestigations: ['Chest X-ray', 'Sputum AFB', 'CBC'],
      suggestedTreatments: ['Antitussives', 'Bronchodilators', 'Antibiotics if bacterial']
    },
    {
      symptom: 'Shortness of Breath',
      category: 'Respiratory',
      commonCauses: ['Asthma', 'Pneumonia', 'Heart failure', 'Anemia', 'PE'],
      redFlags: ['Severe dyspnea at rest', 'Cyanosis', 'Altered consciousness'],
      suggestedInvestigations: ['Chest X-ray', 'ECG', 'CBC', 'Oxygen saturation'],
      suggestedTreatments: ['Oxygen therapy', 'Bronchodilators', 'Diuretics if HF']
    },
    {
      symptom: 'Chest Pain',
      category: 'Cardiovascular',
      commonCauses: ['Angina', 'MI', 'Pericarditis', 'GERD', 'Musculoskeletal'],
      redFlags: ['Crushing pain', 'Radiation to arm/jaw', 'Associated sweating', 'Dyspnea'],
      suggestedInvestigations: ['ECG', 'Cardiac enzymes', 'Chest X-ray'],
      suggestedTreatments: ['Aspirin', 'Nitroglycerin', 'Analgesics']
    },
    {
      symptom: 'Abdominal Pain',
      category: 'Gastrointestinal',
      commonCauses: ['Gastritis', 'Appendicitis', 'Cholecystitis', 'Peptic ulcer'],
      redFlags: ['Rigid abdomen', 'Rebound tenderness', 'Vomiting blood', 'Black stools'],
      suggestedInvestigations: ['Abdominal ultrasound', 'CBC', 'Liver function tests'],
      suggestedTreatments: ['Antispasmodics', 'PPIs', 'Antibiotics if infection']
    },
    {
      symptom: 'Nausea/Vomiting',
      category: 'Gastrointestinal',
      commonCauses: ['Gastroenteritis', 'Food poisoning', 'Pregnancy', 'Medications'],
      redFlags: ['Blood in vomit', 'Severe dehydration', 'Severe abdominal pain'],
      suggestedInvestigations: ['Electrolytes', 'Pregnancy test', 'Abdominal imaging'],
      suggestedTreatments: ['Antiemetics', 'ORS', 'Small frequent meals']
    },
    {
      symptom: 'Diarrhea',
      category: 'Gastrointestinal',
      commonCauses: ['Gastroenteritis', 'Food poisoning', 'IBD', 'Medications'],
      redFlags: ['Blood in stool', 'Severe dehydration', 'Duration > 7 days'],
      suggestedInvestigations: ['Stool microscopy', 'Stool culture', 'Electrolytes'],
      suggestedTreatments: ['ORS', 'Zinc supplementation', 'Antibiotics if bacterial']
    },
    {
      symptom: 'Joint Pain',
      category: 'Musculoskeletal',
      commonCauses: ['Osteoarthritis', 'Rheumatoid arthritis', 'Gout', 'Injury'],
      redFlags: ['Single hot swollen joint', 'Morning stiffness > 1 hour', 'Multiple joints'],
      suggestedInvestigations: ['X-ray', 'RF', 'ESR', 'Uric acid'],
      suggestedTreatments: ['NSAIDs', 'Rest', 'Physical therapy']
    },
    {
      symptom: 'Back Pain',
      category: 'Musculoskeletal',
      commonCauses: ['Muscle strain', 'Disc herniation', 'Osteoarthritis'],
      redFlags: ['Neurological deficits', 'Loss of bladder/bowel control', 'Trauma history'],
      suggestedInvestigations: ['X-ray', 'MRI if neurological signs'],
      suggestedTreatments: ['NSAIDs', 'Muscle relaxants', 'Physical therapy']
    },
    {
      symptom: 'Fatigue',
      category: 'General',
      commonCauses: ['Anemia', 'Thyroid disorders', 'Depression', 'Chronic diseases'],
      redFlags: ['Unexplained weight loss', 'Night sweats', 'Persistent fever'],
      suggestedInvestigations: ['CBC', 'TSH', 'Blood sugar', 'Liver/Kidney function'],
      suggestedTreatments: ['Treat underlying cause', 'Iron supplements if anemic', 'Lifestyle changes']
    },
    {
      symptom: 'Dizziness',
      category: 'Neurological',
      commonCauses: ['Vertigo', 'Hypotension', 'Anemia', 'Dehydration'],
      redFlags: ['Associated weakness', 'Slurred speech', 'Severe headache'],
      suggestedInvestigations: ['BP measurement', 'CBC', 'Blood sugar', 'ECG'],
      suggestedTreatments: ['Hydration', 'Meclizine', 'Treat underlying cause']
    },
    {
      symptom: 'Skin Rash',
      category: 'Dermatological',
      commonCauses: ['Allergic reaction', 'Infections', 'Autoimmune', 'Drug reaction'],
      redFlags: ['Rapid spread', 'Associated fever', 'Mucosal involvement', 'Blistering'],
      suggestedInvestigations: ['Skin scraping', 'Allergy testing', 'CBC'],
      suggestedTreatments: ['Antihistamines', 'Topical steroids', 'Avoid triggers']
    },
    {
      symptom: 'Vaginal Discharge',
      category: 'Gynecological',
      commonCauses: ['Bacterial vaginosis', 'Candidiasis', 'Trichomoniasis', 'STIs'],
      redFlags: ['Foul odor', 'Associated bleeding', 'Pelvic pain', 'Fever'],
      suggestedInvestigations: ['Vaginal swab', 'Wet mount', 'pH testing'],
      suggestedTreatments: ['Antifungals', 'Antibiotics', 'Partner treatment if STI']
    },
    {
      symptom: 'Difficulty Urinating',
      category: 'Genitourinary',
      commonCauses: ['UTI', 'BPH', 'Kidney stones', 'Prostatitis'],
      redFlags: ['Complete retention', 'Blood in urine', 'Severe pain', 'Fever'],
      suggestedInvestigations: ['Urinalysis', 'Urine culture', 'Ultrasound KUB'],
      suggestedTreatments: ['Antibiotics', 'Alpha-blockers', 'Increased fluid intake']
    }
  ];

  await SymptomCatalog.deleteMany({});
  const createdSymptoms = await SymptomCatalog.insertMany(symptoms);
  console.log(`✅ Created ${createdSymptoms.length} symptoms`);
  return createdSymptoms;
};

const seedDrugs = async () => {
  console.log('\n💊 Seeding Drug Catalog...');
  
  const drugs = [
    {
      drugName: 'Paracetamol (Acetaminophen)',
      category: 'Analgesic/Antipyretic',
      dosageForm: 'Tablet',
      strength: '500mg',
      route: 'Oral',
      adultDose: '500-1000mg every 4-6 hours (Max 4g/day)',
      pediatricDose: '10-15mg/kg every 4-6 hours',
      indications: ['Pain', 'Fever'],
      contraindications: ['Severe liver disease'],
      sideEffects: ['Hepatotoxicity in overdose', 'Rare skin reactions'],
      pregnancyCategory: 'A - Safe',
      lactationSafe: true
    },
    {
      drugName: 'Ibuprofen',
      category: 'NSAID',
      dosageForm: 'Tablet',
      strength: '400mg',
      route: 'Oral',
      adultDose: '400mg every 6-8 hours with food',
      pediatricDose: '10mg/kg every 6-8 hours',
      indications: ['Pain', 'Inflammation', 'Fever'],
      contraindications: ['Peptic ulcer', 'Severe kidney disease', 'Asthma'],
      sideEffects: ['GI upset', 'Ulcer', 'Kidney impairment'],
      pregnancyCategory: 'C - Use with caution (avoid in 3rd trimester)',
      lactationSafe: true
    },
    {
      drugName: 'Amoxicillin',
      category: 'Antibiotic',
      dosageForm: 'Capsule',
      strength: '500mg',
      route: 'Oral',
      adultDose: '500mg three times daily',
      pediatricDose: '20-40mg/kg/day divided into 3 doses',
      indications: ['Bacterial infections', 'RTI', 'UTI'],
      contraindications: ['Penicillin allergy'],
      sideEffects: ['Diarrhea', 'Nausea', 'Rash'],
      pregnancyCategory: 'B - Generally safe',
      lactationSafe: true
    },
    {
      drugName: 'Azithromycin',
      category: 'Antibiotic',
      dosageForm: 'Tablet',
      strength: '500mg',
      route: 'Oral',
      adultDose: '500mg day 1, then 250mg days 2-5',
      pediatricDose: '10mg/kg day 1, then 5mg/kg days 2-5',
      indications: ['RTI', 'STI', 'Skin infections'],
      contraindications: ['Macrolide allergy', 'Severe liver disease'],
      sideEffects: ['GI upset', 'QT prolongation'],
      pregnancyCategory: 'B - Generally safe',
      lactationSafe: true
    },
    {
      drugName: 'Metformin',
      category: 'Antidiabetic',
      dosageForm: 'Tablet',
      strength: '500mg',
      route: 'Oral',
      adultDose: '500mg twice daily with meals, titrate up',
      pediatricDose: 'Not recommended < 10 years',
      indications: ['Type 2 Diabetes'],
      contraindications: ['Kidney disease', 'Metabolic acidosis'],
      sideEffects: ['GI upset', 'Lactic acidosis (rare)'],
      pregnancyCategory: 'B - Used in gestational diabetes',
      lactationSafe: true
    },
    {
      drugName: 'Omeprazole',
      category: 'Proton Pump Inhibitor',
      dosageForm: 'Capsule',
      strength: '20mg',
      route: 'Oral',
      adultDose: '20mg once daily before breakfast',
      pediatricDose: 'Consult specialist',
      indications: ['GERD', 'Peptic ulcer', 'Gastritis'],
      contraindications: ['Hypersensitivity'],
      sideEffects: ['Headache', 'Diarrhea', 'B12 deficiency (long-term)'],
      pregnancyCategory: 'C - Use if benefit outweighs risk',
      lactationSafe: true
    },
    {
      drugName: 'Salbutamol (Albuterol)',
      category: 'Bronchodilator',
      dosageForm: 'Inhaler',
      strength: '100mcg/puff',
      route: 'Inhalation',
      adultDose: '1-2 puffs every 4-6 hours as needed',
      pediatricDose: '1 puff every 4-6 hours as needed',
      indications: ['Asthma', 'COPD', 'Bronchospasm'],
      contraindications: ['Hypersensitivity'],
      sideEffects: ['Tremor', 'Palpitations', 'Tachycardia'],
      pregnancyCategory: 'C - Use if needed',
      lactationSafe: true
    },
    {
      drugName: 'Amlodipine',
      category: 'Antihypertensive',
      dosageForm: 'Tablet',
      strength: '5mg',
      route: 'Oral',
      adultDose: '5mg once daily',
      pediatricDose: 'Consult specialist',
      indications: ['Hypertension', 'Angina'],
      contraindications: ['Severe hypotension', 'Cardiogenic shock'],
      sideEffects: ['Peripheral edema', 'Flushing', 'Dizziness'],
      pregnancyCategory: 'C - Use with caution',
      lactationSafe: false
    },
    {
      drugName: 'Furosemide',
      category: 'Diuretic',
      dosageForm: 'Tablet',
      strength: '40mg',
      route: 'Oral',
      adultDose: '40-80mg once or twice daily',
      pediatricDose: '1-2mg/kg/dose',
      indications: ['Edema', 'Heart failure', 'Hypertension'],
      contraindications: ['Anuria', 'Severe electrolyte imbalance'],
      sideEffects: ['Hypokalemia', 'Dehydration', 'Hypotension'],
      pregnancyCategory: 'C - Use only if clearly needed',
      lactationSafe: false
    },
    {
      drugName: 'Ferrous Sulfate',
      category: 'Iron Supplement',
      dosageForm: 'Tablet',
      strength: '200mg',
      route: 'Oral',
      adultDose: '200mg once or twice daily',
      pediatricDose: '3-6mg/kg elemental iron daily',
      indications: ['Iron deficiency anemia'],
      contraindications: ['Hemochromatosis', 'Hemosiderosis'],
      sideEffects: ['Constipation', 'Nausea', 'Dark stools'],
      pregnancyCategory: 'A - Safe and recommended',
      lactationSafe: true
    },
    {
      drugName: 'Folic Acid',
      category: 'Vitamin',
      dosageForm: 'Tablet',
      strength: '5mg',
      route: 'Oral',
      adultDose: '5mg once daily',
      pediatricDose: '0.5-1mg daily',
      indications: ['Folate deficiency', 'Pregnancy prophylaxis'],
      contraindications: ['Hypersensitivity'],
      sideEffects: ['Rare allergic reactions'],
      pregnancyCategory: 'A - Essential in pregnancy',
      lactationSafe: true
    },
    {
      drugName: 'Albendazole',
      category: 'Antiparasitic',
      dosageForm: 'Tablet',
      strength: '400mg',
      route: 'Oral',
      adultDose: '400mg single dose',
      pediatricDose: '400mg single dose (>2 years)',
      indications: ['Intestinal worms', 'Hookworm', 'Roundworm'],
      contraindications: ['Pregnancy (1st trimester)', 'Hypersensitivity'],
      sideEffects: ['Abdominal pain', 'Nausea', 'Dizziness'],
      pregnancyCategory: 'C - Avoid in 1st trimester',
      lactationSafe: true
    },
    {
      drugName: 'Chlorpheniramine',
      category: 'Antihistamine',
      dosageForm: 'Tablet',
      strength: '4mg',
      route: 'Oral',
      adultDose: '4mg every 4-6 hours',
      pediatricDose: '0.35mg/kg/day divided',
      indications: ['Allergic rhinitis', 'Urticaria', 'Pruritus'],
      contraindications: ['Acute asthma attack', 'Newborns'],
      sideEffects: ['Drowsiness', 'Dry mouth', 'Blurred vision'],
      pregnancyCategory: 'B - Generally safe',
      lactationSafe: true
    },
    {
      drugName: 'Metronidazole',
      category: 'Antibiotic/Antiprotozoal',
      dosageForm: 'Tablet',
      strength: '500mg',
      route: 'Oral',
      adultDose: '500mg three times daily',
      pediatricDose: '7.5mg/kg three times daily',
      indications: ['Anaerobic infections', 'Amoebiasis', 'Giardiasis', 'BV'],
      contraindications: ['1st trimester pregnancy', 'Alcohol use'],
      sideEffects: ['Metallic taste', 'Nausea', 'Disulfiram-like reaction with alcohol'],
      pregnancyCategory: 'B - Avoid in 1st trimester',
      lactationSafe: false
    },
    {
      drugName: 'ORS (Oral Rehydration Salts)',
      category: 'Electrolyte Solution',
      dosageForm: 'Powder for solution',
      strength: 'Standard WHO formula',
      route: 'Oral',
      adultDose: 'As needed for dehydration',
      pediatricDose: '50-100ml/kg over 4 hours for mild-moderate dehydration',
      indications: ['Dehydration', 'Diarrhea', 'Cholera'],
      contraindications: ['None'],
      sideEffects: ['None when used correctly'],
      pregnancyCategory: 'A - Safe',
      lactationSafe: true
    }
  ];

  await DrugCatalog.deleteMany({});
  const createdDrugs = await DrugCatalog.insertMany(drugs);
  console.log(`✅ Created ${createdDrugs.length} drugs`);
  return createdDrugs;
};

const main = async () => {
  await connectDB();
  
  console.log('\n🚀 Starting FMCS Database Seeding...\n');
  console.log('=' .repeat(50));
  
  try {
    await seedUsers();
    await seedPatients();
    await seedLabCatalog();
    await seedICD11Codes();
    await seedSymptoms();
    await seedDrugs();
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📝 Default Credentials:');
    console.log('   Admin: admin@fmcs.com / Admin123!');
    console.log('   Doctor: dr.eeyob@fmcs.com / Doctor123!');
    console.log('   Lab Tech: lab.tech@fmcs.com / LabTech123!');
    console.log('   Receptionist: receptionist@fmcs.com / Recept123!');
    console.log('=' .repeat(50) + '\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding Error:', error);
    process.exit(1);
  }
};

main();