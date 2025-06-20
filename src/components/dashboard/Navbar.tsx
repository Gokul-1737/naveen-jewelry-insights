
import { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Gem, 
  Home, 
  LogOut, 
  Menu, 
  TrendingUp, 
  X,
  Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = ({ user, currentPage, onPageChange, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'today-sales', label: 'Today Sales', icon: Calendar },
    { id: 'monthly-sales', label: 'Monthly Sales', icon: BarChart3 },
    { id: 'yearly-sales', label: 'Yearly Sales', icon: TrendingUp },
    { id: 'stock-maintenance', label: 'Stock Maintenance', icon: Wrench },
    { id: 'export', label: 'Export Data', icon: Download },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Desktop toggle button */}
      <Button
        variant="ghost"
        size="sm"
        className="hidden lg:block fixed top-4 left-4 z-50 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-200"
        onClick={toggleSidebar}
      >
        <Menu size={20} />
      </Button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      } w-64`}>
        {/* Glassmorphic sidebar */}
        <div className="h-full backdrop-blur-lg bg-white/20 border-r border-white/30 shadow-2xl">
          {/* Header */}
          <div className={`p-6 border-b border-white/20 transition-all duration-300 ${
            isCollapsed ? 'lg:p-3' : ''
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110">
                <Gem className="text-white" size={20} />
              </div>
              <div className={`transition-all duration-300 ${
                isCollapsed ? 'lg:hidden' : ''
              }`}>
                <h1 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  Naveen Jewelry
                </h1>
                <p className="text-xs text-gray-500">Stock Dashboard</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className={`p-4 space-y-2 ${isCollapsed ? 'lg:p-2' : ''}`}>
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 animate-fade-in group ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-white/30 hover:text-gray-800'
                  } ${
                    isCollapsed ? 'lg:px-2 lg:justify-center' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={18} className="transition-transform group-hover:scale-110" />
                  <span className={`font-medium transition-all duration-300 ${
                    isCollapsed ? 'lg:hidden' : ''
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 ${
            isCollapsed ? 'lg:p-2' : ''
          }`}>
            <div className={`flex items-center justify-between ${
              isCollapsed ? 'lg:flex-col lg:space-y-2' : ''
            }`}>
              <div className={`flex items-center space-x-3 ${
                isCollapsed ? 'lg:flex-col lg:space-x-0 lg:space-y-1' : ''
              }`}>
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110">
                  <span className="text-xs font-bold text-white">
                    {user?.name?.charAt(0) || 'N'}
                  </span>
                </div>
                <div className={`flex-1 transition-all duration-300 ${
                  isCollapsed ? 'lg:hidden' : ''
                }`}>
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-gray-500 hover:text-red-500 transition-colors duration-200 hover:scale-110"
                title="Logout"
              >
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
