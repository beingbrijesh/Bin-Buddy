import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn } from 'lucide-react';
import './SignInPage.css';

const SignInPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    // Check if we have a stored email from signup
    const lastSignupEmail = sessionStorage.getItem('lastSignupEmail');
    if (lastSignupEmail) {
      setFormData(prev => ({ ...prev, email: lastSignupEmail }));
      sessionStorage.removeItem('lastSignupEmail'); // Clear it after use
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/signup" className="font-medium text-green-600 hover:text-green-500">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <Link to="/forgot-password" className="auth-link small">
            Forgot your password?
          </Link>
        </div>

        <div className="auth-roles">
          <p className="roles-title">Test Accounts:</p>
          <div className="roles-list">
            <div className="role-item">
              <span className="role-badge user">User</span>
              user@example.com
            </div>
            <div className="role-item">
              <span className="role-badge worker">Worker</span>
              worker@example.com
            </div>
            <div className="role-item">
              <span className="role-badge volunteer">Volunteer</span>
              volunteer@example.com
            </div>
            <div className="role-item">
              <span className="role-badge admin">Admin</span>
              admin@example.com
            </div>
          </div>
          <p className="roles-note">Default passwords: role@12345 (e.g., worker@12345)</p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;