import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import patientRoutes from './routes/patients.js';
import appointmentRoutes from './routes/appointments.js';
import labRequestRoutes from './routes/labRequests.js';
import labCatalogRoutes from './routes/labCatalog.js';
import certificateRoutes from './routes/certificates.js';
import invoiceRoutes from './routes/invoices.js';
import hmisReportRoutes from './routes/hmisReports.js';
import icd11Routes from './routes/icd11.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/lab-requests', labRequestRoutes);
app.use('/api/lab-catalog', labCatalogRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports/hmis', hmisReportRoutes);
app.use('/api/icd11', icd11Routes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FMCS API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
