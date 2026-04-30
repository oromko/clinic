const QRCode = require('qrcode');
const pdfkit = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  constructor() {
    this.logoPath = path.join(__dirname, '../public/logo.png'); // Placeholder
  }

  async generateQRCode(data) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(data);
      return qrCodeDataUrl;
    } catch (err) {
      console.error('QR Code generation failed:', err);
      return null;
    }
  }

  async generateMedicalCertificate(certData, patient, doctor, labResults = []) {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new pdfkit({ margin: 50 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        const qrData = JSON.stringify({
          id: certData.certificateId,
          patient: patient.firstName + ' ' + patient.lastName,
          date: certData.issueDate,
          verified: true
        });
        const qrCodeImage = await this.generateQRCode(qrData);

        // Header Section
        doc.fontSize(20).font('Helvetica-Bold').text('FAMILY MEDIUM CLINIC', { align: 'center' });
        doc.fontSize(12).font('Helvetica').text('Comprehensive Healthcare Services', { align: 'center' });
        doc.text('P.O. Box 1234, Addis Ababa, Ethiopia | Tel: +251-11-123-4567', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).font('Helvetica-Bold').text(`MEDICAL CERTIFICATE`, { align: 'center', underline: true });
        doc.fontSize(10).font('Helvetica').text(`Certificate ID: ${certData.certificateId}`, { align: 'right' });
        doc.moveDown();

        // Patient Information Section
        doc.fontSize(12).font('Helvetica-Bold').text('PATIENT INFORMATION');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Name: ${patient.firstName} ${patient.lastName}`);
        doc.text(`Age/Sex: ${patient.age} / ${patient.gender}`);
        doc.text(`MRN: ${patient.mrn || 'N/A'}`);
        doc.text(`Address: ${patient.address || 'Not Provided'}`);
        doc.moveDown();

        // Vital Signs Section
        if (certData.vitals) {
          doc.fontSize(12).font('Helvetica-Bold').text('VITAL SIGNS');
          doc.fontSize(10).font('Helvetica');
          doc.text(`BP: ${certData.vitals.bp || 'N/A'} mmHg`);
          doc.text(`HR: ${certData.vitals.hr || 'N/A'} bpm`);
          doc.text(`Temp: ${certData.vitals.temp || 'N/A'} °C`);
          doc.text(`RR: ${certData.vitals.rr || 'N/A'} /min`);
          doc.text(`SpO2: ${certData.vitals.spo2 || 'N/A'} %`);
          doc.moveDown();
        }

        // Clinical Examination Section
        if (certData.examination) {
          doc.fontSize(12).font('Helvetica-Bold').text('CLINICAL EXAMINATION');
          doc.fontSize(10).font('Helvetica');
          doc.text(certData.examination, { align: 'justify' });
          doc.moveDown();
        }

        // Laboratory Investigation Section
        if (labResults && labResults.length > 0) {
          doc.fontSize(12).font('Helvetica-Bold').text('LABORATORY INVESTIGATIONS');
          doc.fontSize(10).font('Helvetica');
          labResults.forEach((lab, index) => {
            doc.text(`${index + 1}. ${lab.testName}: ${lab.result} ${lab.unit} ${lab.flag ? `(${lab.flag})` : ''}`);
          });
          doc.moveDown();
        }

        // Footer Section: Final Result & Declaration
        doc.fontSize(12).font('Helvetica-Bold').text('FINAL RESULT & DECLARATION');
        doc.fontSize(10).font('Helvetica');
        doc.text(certData.diagnosis || certData.remarks, { align: 'justify' });
        doc.moveDown(2);

        // Signature Area
        doc.moveTo(70, doc.y).lineTo(250, doc.y).stroke();
        doc.text(doctor.fullName || 'Dr. Name', 70, doc.y + 5);
        doc.text('Attending Physician', 70, doc.y + 20);
        doc.text(`License: ${doctor.licenseNumber || 'N/A'}`, 70, doc.y + 35);

        // QR Code Placement
        if (qrCodeImage) {
          const qrSize = 80;
          const pageWidth = doc.page.width;
          const qrX = pageWidth - 100;
          const qrY = doc.page.height - 100;
          
          // Note: In real implementation, we need to convert dataURL to buffer for PDFKit
          // This is a placeholder logic for the structure
          doc.fontSize(8).text('Scan to Verify', qrX, qrY + qrSize + 5);
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateLabResultPDF(labRequest, patient, doctor, results) {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new pdfkit({ margin: 50 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        const qrData = JSON.stringify({ id: labRequest.labId, status: 'Finalized' });
        await this.generateQRCode(qrData); // Generated for verification link

        // Header
        doc.fontSize(18).font('Helvetica-Bold').text('FAMILY MEDIUM CLINIC', { align: 'center' });
        doc.fontSize(14).text('LABORATORY REPORT', { align: 'center' });
        doc.fontSize(10).font('Helvetica').text(`Report Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();

        // Patient Info
        doc.fontSize(12).font('Helvetica-Bold').text('Patient Details');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Name: ${patient.firstName} ${patient.lastName}`);
        doc.text(`ID: ${patient.mrn}`);
        doc.text(`Age/Sex: ${patient.age}/${patient.gender}`);
        doc.moveDown();

        // Request Info
        doc.fontSize(12).font('Helvetica-Bold').text('Request Details');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Lab ID: ${labRequest.labId}`);
        doc.text(`Requested By: Dr. ${doctor.fullName}`);
        doc.text(`Priority: ${labRequest.priority.toUpperCase()}`);
        doc.moveDown();

        // Results Table
        doc.fontSize(12).font('Helvetica-Bold').text('Test Results');
        doc.fontSize(10).font('Helvetica');
        
        results.forEach((item, idx) => {
          const y = doc.y;
          doc.text(`${idx + 1}. ${item.testName}`, 50, y);
          doc.text(`${item.result} ${item.unit}`, 250, y);
          doc.text(`Ref: ${item.referenceRange}`, 350, y);
          if (item.flag) {
            doc.text(item.flag, 500, y, { color: item.flag === 'High' || item.flag === 'Critical High' ? 'red' : 'blue' });
          }
          doc.moveDown(0.5);
        });

        doc.moveDown(2);
        
        // Verification
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
        doc.text('Verified By:', 50);
        doc.text(doctor.fullName, 150);
        doc.text('Signature: __________________', 300);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async generatePrescriptionPDF(medicalRecord, patient, doctor, drugs) {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new pdfkit({ margin: 50 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        const qrData = JSON.stringify({ recordId: medicalRecord._id, type: 'Prescription' });
        await this.generateQRCode(qrData);

        // Header
        doc.fontSize(18).font('Helvetica-Bold').text('FAMILY MEDIUM CLINIC', { align: 'center' });
        doc.fontSize(14).text('PRESCRIPTION', { align: 'center' });
        doc.moveDown();

        // Patient
        doc.fontSize(10).font('Helvetica');
        doc.text(`Patient: ${patient.firstName} ${patient.lastName} (${patient.age}y/${patient.gender})`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();

        // Rx Symbol
        doc.fontSize(20).font('Helvetica-Bold').text('Rx', { align: 'left' });
        doc.moveDown(0.5);

        // Drugs List
        doc.fontSize(11).font('Helvetica');
        drugs.forEach((drug, idx) => {
          doc.text(`${idx + 1}. ${drug.name} ${drug.dosage} - ${drug.frequency}`, { align: 'left' });
          doc.text(`   Duration: ${drug.duration} days`, { indent: 20 });
          doc.moveDown(0.3);
        });

        doc.moveDown(2);
        
        // Doctor Sign
        doc.moveTo(50, doc.y).lineTo(250, doc.y).stroke();
        doc.text(doctor.fullName, 50, doc.y + 5);
        doc.text('Prescriber', 50, doc.y + 20);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default new PDFService();
