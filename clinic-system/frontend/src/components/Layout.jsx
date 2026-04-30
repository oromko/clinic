import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: #f3f4f6;
        }

        .layout {
          display: flex;
          min-height: 100vh;
        }

        .main-content {
          margin-left: 250px;
          margin-top: 70px;
          flex: 1;
          padding: 30px;
        }

        .page-title {
          font-size: 24px;
          color: #1f2937;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 20px;
          margin-bottom: 20px;
        }

        .card-title {
          font-size: 18px;
          color: #1f2937;
          margin-bottom: 15px;
          font-weight: 600;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
        }

        .btn-primary {
          background: #1e40af;
          color: white;
        }

        .btn-primary:hover {
          background: #1e3a8a;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-success {
          background: #059669;
          color: white;
        }

        .btn-danger {
          background: #dc2626;
          color: white;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .form-input:focus {
          outline: none;
          border-color: #1e40af;
        }

        .form-select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: white;
        }

        .table-container {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        th {
          background: #f9fafb;
          font-weight: 600;
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
        }

        td {
          font-size: 14px;
          color: #1f2937;
        }

        tr:hover {
          background: #f9fafb;
        }

        .badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .badge-success {
          background: #d1fae5;
          color: #065f46;
        }

        .badge-warning {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-danger {
          background: #fee2e2;
          color: #991b1b;
        }

        .badge-info {
          background: #dbeafe;
          color: #1e40af;
        }

        .grid {
          display: grid;
          gap: 20px;
        }

        .grid-2 {
          grid-template-columns: repeat(2, 1fr);
        }

        .grid-3 {
          grid-template-columns: repeat(3, 1fr);
        }

        .grid-4 {
          grid-template-columns: repeat(4, 1fr);
        }

        .stats-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stats-value {
          font-size: 32px;
          font-weight: 700;
          color: #1e40af;
          margin: 10px 0;
        }

        .stats-label {
          font-size: 14px;
          color: #6b7280;
        }
      `}</style>
      
      {/* Sidebar and Header are rendered in App.jsx */}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;
