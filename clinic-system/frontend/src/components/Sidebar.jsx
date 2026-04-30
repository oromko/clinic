import React from 'react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    const commonItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/appointments', label: 'Appointments', icon: '📅' },
      { path: '/patients', label: 'Patients', icon: '👥' },
    ];

    const roleSpecificItems = {
      Admin: [
        { path: '/users', label: 'User Management', icon: '👤' },
        { path: '/lab-catalog', label: 'Lab Catalog', icon: '🧪' },
        { path: '/reports', label: 'HMIS Reports', icon: '📈' },
        { path: '/settings', label: 'Settings', icon: '⚙️' },
      ],
      Doctor: [
        { path: '/medical-records', label: 'Medical Records', icon: '📋' },
        { path: '/lab-requests', label: 'Lab Requests', icon: '🔬' },
        { path: '/certificates', label: 'Certificates', icon: '📜' },
        { path: '/invoices', label: 'Billing', icon: '💰' },
        { path: '/rmnch', label: 'RMNCH Services', icon: '👶' },
      ],
      LabTech: [
        { path: '/lab-workqueue', label: 'Lab Work Queue', icon: '🔬' },
        { path: '/lab-results', label: 'Result Entry', icon: '📝' },
        { path: '/lab-verification', label: 'Verification', icon: '✅' },
      ],
      Receptionist: [
        { path: '/appointments', label: 'Appointment Booking', icon: '📅' },
        { path: '/patients', label: 'Patient Registration', icon: '👤' },
        { path: '/invoices', label: 'Billing & Payments', icon: '💵' },
      ],
    };

    return [...commonItems, ...(roleSpecificItems[user?.role] || [])];
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>FMCS</h2>
        <p>Family Medium Clinic</p>
      </div>
      
      <nav className="sidebar-nav">
        {getMenuItems().map((item) => (
          <a key={item.path} href={item.path} className="nav-item">
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <p className="user-name">{user?.name}</p>
          <p className="user-role">{user?.role}</p>
        </div>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          width: 250px;
          height: 100vh;
          background: linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%);
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
        }

        .sidebar-header {
          padding: 20px;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }

        .sidebar-header p {
          margin: 5px 0 0;
          font-size: 12px;
          opacity: 0.8;
        }

        .sidebar-nav {
          flex: 1;
          padding: 20px 0;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          transition: all 0.3s;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-icon {
          margin-right: 12px;
          font-size: 18px;
        }

        .nav-label {
          font-size: 14px;
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-info {
          margin-bottom: 15px;
        }

        .user-name {
          margin: 0;
          font-weight: 600;
          font-size: 14px;
        }

        .user-role {
          margin: 5px 0 0;
          font-size: 12px;
          opacity: 0.8;
        }

        .logout-btn {
          width: 100%;
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
