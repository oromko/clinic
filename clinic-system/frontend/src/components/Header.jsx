import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        <h1>Family Medium Clinic System</h1>
      </div>
      
      <div className="header-right">
        <div className="notification-icon">
          🔔
          <span className="notification-badge">3</span>
        </div>
        
        <div className="user-profile">
          <div className="avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.name || 'User'}</p>
            <p className="user-role">{user?.role || 'Role'}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .header {
          height: 70px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 30px;
          position: fixed;
          left: 250px;
          right: 0;
          top: 0;
          z-index: 100;
        }

        .header-left h1 {
          margin: 0;
          font-size: 20px;
          color: #1e40af;
          font-weight: 600;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .notification-icon {
          position: relative;
          cursor: pointer;
          font-size: 20px;
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          padding: 2px 5px;
          border-radius: 10px;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
        }

        .user-details {
          text-align: left;
        }

        .user-name {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .user-role {
          margin: 2px 0 0;
          font-size: 12px;
          color: #6b7280;
        }
      `}</style>
    </header>
  );
};

export default Header;
