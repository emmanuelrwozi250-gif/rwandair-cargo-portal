import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ShipmentProvider } from './context/ShipmentContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookShipment from './pages/BookShipment';
import TrackShipment from './pages/TrackShipment';
import MyShipments from './pages/MyShipments';
import ShipmentDetail from './pages/ShipmentDetail';
import RateCalculator from './pages/RateCalculator';
import './App.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-layout">
      <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="app-body">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`app-main${sidebarOpen ? ' main-shifted' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ShipmentProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <Layout>
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/book"
              element={
                <Layout>
                  <ProtectedRoute>
                    <BookShipment />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/shipments"
              element={
                <Layout>
                  <ProtectedRoute>
                    <MyShipments />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/shipments/:awb"
              element={
                <Layout>
                  <ProtectedRoute>
                    <ShipmentDetail />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/track"
              element={
                <Layout>
                  <TrackShipment />
                </Layout>
              }
            />
            <Route
              path="/rates"
              element={
                <Layout>
                  <RateCalculator />
                </Layout>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ShipmentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
