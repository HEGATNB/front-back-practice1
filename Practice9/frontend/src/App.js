import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import PrivateRoute from './components/PrivateRoute';
import './styles/App.scss';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={
            <PrivateRoute>
              <ProductsPage />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/products" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;