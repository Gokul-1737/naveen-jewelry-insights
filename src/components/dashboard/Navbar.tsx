
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
  Wrench,
  Upload
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
    { id: 'import', label: 'Import Data', icon: Upload },
    { id: 'export', label: 'Export Data', icon: Download },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handlePageChange = (pageId) => {
    onPageChange(pageId);
    setIsOpen(false); // Auto-close mobile menu when page is selected
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-110 animate-fade-in"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </div>
      </Button>

      {/* Desktop toggle button */}
      <Button
        variant="ghost"
        size="sm"
        className="hidden lg:block fixed top-4 left-4 z-50 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-110 animate-fade-in"
        onClick={toggleSidebar}
      >
        <div className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
          <Menu size={20} />
        </div>
      </Button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-all duration-500 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${
        isCollapsed ? 'lg:w-20' : 'lg:w-64'
      } w-64`}>
        {/* Glassmorphic sidebar */}
        <div className="h-full backdrop-blur-lg bg-white/20 border-r border-white/30 shadow-2xl animate-slide-in-right">
          {/* Header */}
          <div className={`p-6 border-b border-white/20 transition-all duration-500 ${
            isCollapsed ? 'lg:p-3' : ''
          }`}>
            <div className="flex flex-col items-center space-y-3">
              {/* Main Naveen Jewelry Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12 shadow-lg">
                  <Gem className="text-white animate-pulse" size={24} />
                </div>
                <div className={`transition-all duration-500 ${
                  isCollapsed ? 'lg:hidden' : ''
                }`}>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                    Naveen Jewelry
                  </h1>
                  <p className="text-xs text-gray-500">Stock Dashboard</p>
                </div>
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
                  onClick={() => handlePageChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 animate-fade-in group relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:bg-white/30 hover:text-gray-800 hover:shadow-md'
                  } ${
                    isCollapsed ? 'lg:px-2 lg:justify-center' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  title={isCollapsed ? item.label : ''}
                >
                  {/* Background animation */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 opacity-0 transition-opacity duration-300 ${
                    !isActive ? 'group-hover:opacity-20' : ''
                  }`} />
                  
                  <Icon size={18} className="transition-all duration-300 group-hover:scale-110 relative z-10" />
                  <span className={`font-medium transition-all duration-500 relative z-10 ${
                    isCollapsed ? 'lg:hidden' : ''
                  }`}>
                    {item.label}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 backdrop-blur-sm ${
            isCollapsed ? 'lg:p-2' : ''
          }`}>
            <div className={`flex items-center justify-between transition-all duration-500 ${
              isCollapsed ? 'lg:flex-col lg:space-y-2' : ''
            }`}>
              <div className={`flex items-center space-x-3 transition-all duration-500 ${
                isCollapsed ? 'lg:flex-col lg:space-x-0 lg:space-y-1' : ''
              }`}>
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12 shadow-lg">
                  <span className="text-sm font-bold text-white">
                    {user?.name?.charAt(0) || 'N'}
                  </span>
                </div>
                <div className={`flex-1 transition-all duration-500 ${
                  isCollapsed ? 'lg:hidden' : ''
                }`}>
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-gray-500 hover:text-red-500 transition-all duration-300 hover:scale-110 hover:bg-red-50"
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
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden transition-all duration-500 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
