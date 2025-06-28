import React, { useState, useEffect } from 'react';
import { assets } from '../../assets/assets';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardRoute } from '../../utils/routes';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Navbar - Current user:', user);
  }, [user]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const handleSignIn = () => {
    console.log('Navigating to sign in page');
    navigate('/signin');
    closeMenu();
  };

  const handleSignUp = () => {
    console.log('Navigating to sign up page');
    navigate('/signup');
    closeMenu();
  };

  const handleLogout = async () => {
    console.log('Handling logout');
    await logout();
    closeMenu();
    navigate('/');
  };

  const handleDashboard = () => {
    const dashboardRoute = getDashboardRoute(user?.role);
    console.log('Navigating to dashboard:', dashboardRoute);
    navigate(dashboardRoute);
    closeMenu();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center">
          <img 
  src={assets.logo} 
  alt="BinBuddy Logo" 
  className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 object-contain transition-transform hover:scale-105" 
  loading="eager"
  style={{ 
    objectPosition: 'center'
  }}
/>
          
          </NavLink>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none" 
            onClick={toggleMenu}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `text-base font-medium transition-colors ${isActive ? 'text-[#279e0a]' : 'text-gray-600 hover:text-gray-900'}`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `text-base font-medium transition-colors ${isActive ? 'text-[#279e0a]' : 'text-gray-600 hover:text-gray-900'}`
              }
            >
              About
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => 
                `text-base font-medium transition-colors ${isActive ? 'text-[#279e0a]' : 'text-gray-600 hover:text-gray-900'}`
              }
            >
              Contact
            </NavLink>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <button 
                  onClick={handleDashboard}
                  className="flex items-center gap-2 px-4 py-2 text-[#279e0a] bg-primary-50 rounded-full hover:bg-[#d5efce] transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard ({user.role})
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleSignIn}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={handleSignUp}
                  className="px-4 py-2 bg-[#279e0a] text-white rounded-full hover:bg-[#1c7307] transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div 
          className={`md:hidden transition-all duration-300 ease-in-out ${
            menuOpen 
              ? 'max-h-96 opacity-100 visible' 
              : 'max-h-0 opacity-0 invisible'
          }`}
        >
          <div className="py-4 space-y-4">
            <NavLink 
              to="/" 
              onClick={closeMenu}
              className={({ isActive }) => 
                `block px-4 py-2 text-base font-medium transition-colors ${
                  isActive ? 'text-[#279e0a]' : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/about" 
              onClick={closeMenu}
              className={({ isActive }) => 
                `block px-4 py-2 text-base font-medium transition-colors ${
                  isActive ? 'text-[#279e0a]' : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              About
            </NavLink>
            <NavLink 
              to="/contact" 
              onClick={closeMenu}
              className={({ isActive }) => 
                `block px-4 py-2 text-base font-medium transition-colors ${
                  isActive ? 'text-[#279e0a]' : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              Contact
            </NavLink>

            <div className="pt-4 border-t border-gray-200">
              {user ? (
                <div className="space-y-4 px-4">
                  <button 
                    onClick={handleDashboard}
                    className="flex items-center gap-2 w-full px-4 py-2 text-[#279e0a] bg-primary-50 rounded-full hover:bg-[#d5efce] transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard ({user.role})
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-4 px-4">
                  <button 
                    onClick={handleSignIn}
                    className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={handleSignUp}
                    className="w-full px-4 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;






