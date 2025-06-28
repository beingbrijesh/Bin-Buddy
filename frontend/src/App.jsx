import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import AboutPage from './pages/AboutPage/AboutPage';
import VolunteerPage from './pages/VolunteerPage/VolunteerPage';
import SignUpPage from './pages/SignUpPage/SignUpPage';
import SignInPage from './pages/SignInPage/SignInPage';
import ContactPage from './pages/ContactPage/ContactPage';
import QRGenerator from './pages/QRGenerator/QRGenerator';
import QRScanner from './pages/QRScanner/QRScanner';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import Dashboard from './pages/Dashboard/Dashboard';
import Layout from './components/layout/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { ROLES } from './constants/roles';
import WorkerManagement from './pages/Management/WorkerManagement';
import BinManagement from './pages/Management/BinManagement';
import BinAnalytics from './pages/Management/BinAnalytics';
import MapTestPage from './pages/MapTestPage';
import MapView from './pages/MapView/MapView';
import { BinList, BinForm, BinActivity, BinDetail } from './components/BinManagement';

import { WorkerList, WorkerForm, WorkerActivity, WorkerDetail, WorkerBins } from './components/WorkerManagement';
import WorkerProfile from './pages/Management/WorkerProfile';
import WorkerOwnProfile from './pages/Worker/WorkerOwnProfile';
import MyTasksPage from './pages/Worker/MyTasksPage';
import WorkerHeader from './components/WorkerManagement/WorkerHeader';
import MapsProvider from './components/Maps/MapsProvider';
import ZoneManagement from './pages/Management/ZoneManagement';
import { ZoneList } from './components/ZoneManagement';
import TestWorkerPage from './pages/Management/TestWorkerPage';
import UserManagement from './pages/Management/UserManagement';
import UserProfile from './pages/Management/UserProfile';
import VolunteerManagement from './pages/Management/VolunteerManagement';
import VolunteerProfile from './pages/Management/VolunteerProfile';
import VehicleManagementPage from './pages/VehicleManagement/VehicleManagementPage';
import TaskManagementPage from './pages/TaskManagement/TaskManagementPage';

const WorkerLayout = ({ children }) => {
  return (
    <Layout>
      <WorkerHeader />
      {children}
    </Layout>
  );
};

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Define public routes that should show the navbar
  const publicRoutes = ['/', '/about', '/contact', '/signin', '/signup'];
  const shouldShowNavbar = publicRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-white">
      {shouldShowNavbar && <Navbar />}
      <main className={`${shouldShowNavbar ? 'pt-16' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <Routes>
                <Route index element={<Navigate to={`/${user?.role}/dashboard`} replace />} />
                <Route path="admin" element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="worker" element={
                  <ProtectedRoute allowedRoles={[ROLES.WORKER]}>
                    <WorkerLayout>
                      <Dashboard />
                    </WorkerLayout>
                  </ProtectedRoute>
                } />
                <Route path="volunteer" element={
                  <ProtectedRoute allowedRoles={[ROLES.VOLUNTEER]}>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="user" element={
                  <ProtectedRoute allowedRoles={[ROLES.USER]}>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
              </Routes>
            </ProtectedRoute>
          } />

          {/* Worker Routes */}
          <Route path="/worker/*" element={
            <ProtectedRoute allowedRoles={[ROLES.WORKER]}>
              <WorkerLayout>
                <Routes>
                  <Route path="profile" element={<WorkerOwnProfile />} />
                  <Route path="bins" element={<BinList />} />
                </Routes>
              </WorkerLayout>
            </ProtectedRoute>
          } />

          {/* Management Routes */}
          <Route path="/management/*" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <Layout>
                <Routes>
                  <Route index element={<BinManagement />} />
                  <Route path="zones/*" element={
                    <Routes>
                      <Route index element={<ZoneManagement />} />
                    </Routes>
                  } />
                  <Route path="bins/*" element={
                    <Routes>
                      <Route index element={<BinList />} />
                      <Route path="new" element={<BinForm />} />
                      <Route path="edit/:id" element={<BinForm />} />
                      <Route path=":id" element={<BinDetail />} />
                      <Route path=":id/history" element={<BinActivity />} />
                    </Routes>
                  } />
                  <Route path="tasks" element={<TaskManagementPage />} />
                  <Route path="workers/*" element={
                    <Routes>
                      <Route index element={<WorkerManagement />} />
                      <Route path="list" element={<WorkerList />} />
                      <Route path="new" element={<WorkerForm />} />
                      <Route path="edit/:id" element={<WorkerForm />} />
                      <Route path=":id" element={<WorkerProfile />} />
                      <Route path=":id/activity" element={<WorkerActivity />} />
                      <Route path=":id/bins" element={<WorkerBins />} />
                    </Routes>
                  } />
                  <Route path="users/*" element={
                    <Routes>
                      <Route index element={<UserManagement />} />
                      <Route path=":id" element={<UserProfile />} />
                    </Routes>
                  } />
                  <Route path="volunteers/*" element={
                    <Routes>
                      <Route index element={<VolunteerManagement />} />
                      <Route path=":id" element={<VolunteerProfile />} />
                    </Routes>
                  } />
                  <Route path="vehicles/*" element={
                    <Routes>
                      <Route index element={<VehicleManagementPage />} />
                    </Routes>
                  } />
                  <Route path="analytics" element={<BinAnalytics />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Other Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Worker Specific Routes */}
          <Route path="/worker/profile" element={
            <ProtectedRoute allowedRoles={[ROLES.WORKER]}>
              <WorkerLayout>
                <WorkerOwnProfile />
              </WorkerLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/worker/my-tasks" element={
            <ProtectedRoute allowedRoles={[ROLES.WORKER]}>
              <WorkerLayout>
                <MyTasksPage />
              </WorkerLayout>
            </ProtectedRoute>
          } />

          <Route path="/qr-generator" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <Layout>
                <QRGenerator />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/qr-scanner" element={
            <ProtectedRoute>
              <Layout>
                <QRScanner />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/map-view" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <Layout>
                <MapView />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Test Routes - Remove in production */}
          <Route path="/test/workers" element={<TestWorkerPage />} />

          {/* Redirect old routes to new structure */}
          <Route path="/bins/*" element={<Navigate to="/management/bins" replace />} />

          <Route path="/workers/*" element={<Navigate to="/management/workers" replace />} />
          <Route path="/bin-analytics" element={<Navigate to="/management/analytics" replace />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MapsProvider>
        <AppContent />
      </MapsProvider>
    </AuthProvider>
  );
};

export default App;