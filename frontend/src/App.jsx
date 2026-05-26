import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';

// Pages
import Landing from './pages/Landing';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import ProductDetails from './pages/ProductDetails';
import SellItem from './pages/SellItem';
import Inbox from './pages/Inbox';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import LostFound from './pages/LostFound';
import UploadLostFound from './pages/UploadLostFound';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// Route wrapper that handles layout structure
const AppLayout = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {user ? (
        <div className="flex flex-1 relative">
          <Sidebar />
          <div className="flex-1 pb-16 md:pb-0 overflow-x-hidden min-h-[calc(100vh-4rem)] bg-gray-50/50">
            {children}
          </div>
          <BottomNav />
        </div>
      ) : (
        <div className="flex-1 bg-gray-50/50">
          {children}
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Landing route */}
          <Route path="/" element={<AppLayout><Landing /></AppLayout>} />
          
          {/* Authentication route */}
          <Route path="/auth" element={<AppLayout><LoginRegister /></AppLayout>} />

          {/* Protected Dashboard route */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Protected Listing details route */}
          <Route path="/products/:id" element={
            <ProtectedRoute>
              <AppLayout><ProductDetails /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Protected Sell/Edit listing route */}
          <Route path="/sell" element={
            <ProtectedRoute>
              <AppLayout><SellItem /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Protected Inbox chat route */}
          <Route path="/inbox" element={
            <ProtectedRoute>
              <AppLayout><Inbox /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Protected Profile route */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <AppLayout><Profile /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Protected Lost & Found routes */}
          <Route path="/lost-found" element={
            <ProtectedRoute>
              <AppLayout><LostFound /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/lost-found/upload" element={
            <ProtectedRoute>
              <AppLayout><UploadLostFound /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Protected Admin dashboard route */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AppLayout><AdminDashboard /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Fallback Catch-All route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
