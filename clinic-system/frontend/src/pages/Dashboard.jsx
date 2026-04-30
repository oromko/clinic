import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout, isAdmin, isDoctor, isLabTech, isReceptionist } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardContent = () => {
    if (isAdmin) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="medical-card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Patients</h3>
            <p className="text-4xl font-bold">1,234</p>
            <p className="text-sm mt-2 opacity-80">+12 this week</p>
          </div>
          <div className="medical-card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Today's Appointments</h3>
            <p className="text-4xl font-bold">45</p>
            <p className="text-sm mt-2 opacity-80">32 completed</p>
          </div>
          <div className="medical-card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Pending Lab Results</h3>
            <p className="text-4xl font-bold">18</p>
            <p className="text-sm mt-2 opacity-80">5 urgent</p>
          </div>
          <div className="medical-card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Revenue (Today)</h3>
            <p className="text-4xl font-bold">ETB 45,200</p>
            <p className="text-sm mt-2 opacity-80">+8% from yesterday</p>
          </div>
        </div>
      );
    }

    if (isDoctor) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="medical-card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <h3 className="text-lg font-semibold mb-2">My Patients Today</h3>
            <p className="text-4xl font-bold">15</p>
            <p className="text-sm mt-2 opacity-80">8 remaining</p>
          </div>
          <div className="medical-card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Pending Verifications</h3>
            <p className="text-4xl font-bold">7</p>
            <p className="text-sm mt-2 opacity-80">Lab results to review</p>
          </div>
          <div className="medical-card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Certificates Issued</h3>
            <p className="text-4xl font-bold">23</p>
            <p className="text-sm mt-2 opacity-80">This month</p>
          </div>
        </div>
      );
    }

    if (isLabTech) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="medical-card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Pending Requests</h3>
            <p className="text-4xl font-bold">12</p>
            <p className="text-sm mt-2 opacity-80">3 stat/urgent</p>
          </div>
          <div className="medical-card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <h3 className="text-lg font-semibold mb-2">In Progress</h3>
            <p className="text-4xl font-bold">8</p>
            <p className="text-sm mt-2 opacity-80">Samples being processed</p>
          </div>
          <div className="medical-card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Completed Today</h3>
            <p className="text-4xl font-bold">34</p>
            <p className="text-sm mt-2 opacity-80">Ready for verification</p>
          </div>
        </div>
      );
    }

    if (isReceptionist) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="medical-card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Appointments Today</h3>
            <p className="text-4xl font-bold">45</p>
            <p className="text-sm mt-2 opacity-80">12 walk-ins</p>
          </div>
          <div className="medical-card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <h3 className="text-lg font-semibold mb-2">New Registrations</h3>
            <p className="text-4xl font-bold">8</p>
            <p className="text-sm mt-2 opacity-80">This week</p>
          </div>
          <div className="medical-card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Pending Payments</h3>
            <p className="text-4xl font-bold">15</p>
            <p className="text-sm mt-2 opacity-80">ETB 23,450 outstanding</p>
          </div>
        </div>
      );
    }

    return <p>Welcome to FMCS</p>;
  };

  const getQuickActions = () => {
    const actions = [];
    
    if (isAdmin || isReceptionist) {
      actions.push({ name: 'New Patient', link: '/patients/new', color: 'blue' });
      actions.push({ name: 'Book Appointment', link: '/appointments/new', color: 'green' });
    }
    
    if (isDoctor) {
      actions.push({ name: 'New Medical Record', link: '/records/new', color: 'purple' });
      actions.push({ name: 'Issue Certificate', link: '/certificates/new', color: 'orange' });
    }
    
    if (isLabTech || isDoctor) {
      actions.push({ name: 'Lab Request', link: '/lab/requests/new', color: 'red' });
    }
    
    if (isAdmin || isReceptionist) {
      actions.push({ name: 'Create Invoice', link: '/invoices/new', color: 'yellow' });
    }

    return actions;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Welcome, {user?.name}</h1>
              <p className="text-sm text-gray-500">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
          {getDashboardContent()}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getQuickActions().map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`medical-card hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-${action.color}-500`}
              >
                <h3 className="font-semibold text-gray-900">{action.name}</h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="medical-card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-gray-500 text-center py-8">
            <p>No recent activity to display</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
