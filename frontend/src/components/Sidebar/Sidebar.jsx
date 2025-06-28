import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardRoute } from '../../utils/routes';
import { assets } from '../../assets/assets';
import {
  Home,
  Calendar,
  Truck,
  AlertCircle,
  BookOpen,
  Users,
  History,
  Settings,
  Award,
  FileText,
  Info,
  Mail,
  LogOut,
  Briefcase,
  CheckSquare,
  Box,
  QrCode,
  Scan,
  Map,
  ChevronLeft,
  ChevronRight,
  Menu,
  HelpCircle,
  MessageCircle
} from 'lucide-react';

const Sidebar = ({ onCollapse }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get the role-specific dashboard path
  const dashboardPath = getDashboardRoute(user?.role);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(false);
        onCollapse?.(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onCollapse]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Navigation items remain the same...
  const adminNavItems = [
    { path: dashboardPath, icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/map-view', icon: <Map size={20} />, label: 'Map View' },
    { path: '/management/zones', icon: <Map size={20} />, label: 'Zone Management' },
    { path: '/management/vehicles', icon: <Truck size={20} />, label: 'Vehicle Management' },
    { path: '/management/tasks/schedule', icon: <Calendar size={20} />, label: 'Schedule Pickup' },
    { path: '/management/tasks/track', icon: <Truck size={20} />, label: 'Track Pickup' },
    { path: '/management/workers', icon: <Briefcase size={20} />, label: 'Worker Management' },
    { path: '/management/users', icon: <Users size={20} />, label: 'User Management' },
    { path: '/management/volunteers', icon: <Award size={20} />, label: 'Volunteer Management' },
    { path: '/management/tasks', icon: <CheckSquare size={20} />, label: 'Task Management' },
    { path: '/management', icon: <Box size={20} />, label: 'Bin Management' },
    { path: '/qr-generator', icon: <QrCode size={20} />, label: 'QR Generator' },
    { path: '/management/analytics', icon: <History size={20} />, label: 'Analytics' },
    { path: '/profile', icon: <Settings size={20} />, label: 'Settings' }
  ];

  // Other nav items remain the same...
  const userNavItems = [
    { path: dashboardPath, icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/profile/rewards', icon: <Award size={20} />, label: 'My Rewards' },
    { path: '/profile/reports', icon: <FileText size={20} />, label: 'My Reports' },
    { path: '/qr-scanner', icon: <Scan size={20} />, label: 'QR Scanner' },
    { path: '/about', icon: <Info size={20} />, label: 'About Us' },
    { path: '/contact', icon: <Mail size={20} />, label: 'Contact' }
  ];

  const workerNavItems = [
    { path: dashboardPath, icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/management/tasks', icon: <CheckSquare size={20} />, label: 'My Tasks' },
    { path: '/management/tasks/schedule', icon: <Calendar size={20} />, label: 'Schedule' },
    { path: '/map-view', icon: <Map size={20} />, label: 'Map View' },
    { path: '/qr-scanner', icon: <Scan size={20} />, label: 'QR Scanner' },
    { path: '/profile/reports', icon: <FileText size={20} />, label: 'Reports' }
  ];

  const volunteerNavItems = [
    { path: dashboardPath, icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/management/tasks/events', icon: <Calendar size={20} />, label: 'Events' },
    { path: '/profile/impact', icon: <Award size={20} />, label: 'My Impact' },
    { path: '/map-view', icon: <Map size={20} />, label: 'Map View' },
    { path: '/qr-scanner', icon: <Scan size={20} />, label: 'QR Scanner' },
    { path: '/profile/reports', icon: <FileText size={20} />, label: 'Reports' }
  ];

  const getNavItems = () => {
    let items = [];
    switch (user?.role) {
      case 'admin':
        items = adminNavItems;
        break;
      case 'worker':
        items = workerNavItems;
        break;
      case 'volunteer':
        items = volunteerNavItems;
        break;
      default:
        items = userNavItems;
    }
    return items;
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    onCollapse?.(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md text-gray-600 hover:bg-gray-50"
        onClick={toggleMobileMenu}
      >
        <Menu size={24} />
      </button>

      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-md z-40
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        lg:rounded-r-xl
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="relative flex items-center justify-center p-4 border-b border-gray-100 overflow-hidden h-[100px]">
          <Link to="/" className="block hover:opacity-80 transition-opacity transform-gpu">
            <img 
              src={assets.logo} 
              alt="BinBuddy Logo" 
              className="w-[90px] h-auto object-contain"
              loading="eager"
              style={{ transform: 'scale(2.5)' }}
            />
          </Link>
          <button 
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-green-600 hover:border-green-600 transition-colors shadow-sm"
            onClick={toggleSidebar}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {getNavItems().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center px-4 py-3 gap-3
                ${location.pathname === item.path ? 'text-green-600 bg-green-50' : 'text-gray-600'}
                hover:bg-gray-50 transition-colors
              `}
              title={isCollapsed ? item.label : ''}
            >
              {React.cloneElement(item.icon, { size: 22 })}
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Help and Support Section */}
        <div className="p-3 space-y-2 border-t border-gray-100">
          <Link 
            to="/help" 
            className="flex items-center justify-center gap-2 py-2 px-3 text-sm rounded-lg text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <HelpCircle size={18} />
            {!isCollapsed && <span>Need Help?</span>}
          </Link>
          
          <Link 
            to="/report-issue" 
            className="flex items-center justify-center gap-2 py-2 px-3 text-sm rounded-lg text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <MessageCircle size={18} />
            {!isCollapsed && <span>Report Issue</span>}
          </Link>

          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 text-sm rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar; 