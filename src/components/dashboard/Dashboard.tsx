
import { useState } from 'react';
import Navbar from './Navbar';
import DashboardHome from './DashboardHome';
import TodaySales from './TodaySales';
import MonthlySales from './MonthlySales';
import YearlySales from './YearlySales';
import ExportData from './ExportData';

const Dashboard = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome />;
      case 'today-sales':
        return <TodaySales />;
      case 'monthly-sales':
        return <MonthlySales />;
      case 'yearly-sales':
        return <YearlySales />;
      case 'export':
        return <ExportData />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <Navbar 
        user={user} 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        onLogout={onLogout} 
      />
      <main className="lg:ml-64 p-6">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default Dashboard;
