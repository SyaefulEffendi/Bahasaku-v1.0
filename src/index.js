import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 1. Impor AuthProvider yang sudah Anda buat
import { AuthProvider } from './context'; // Pastikan path ini benar

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 2. Bungkus <App /> dengan <AuthProvider> */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// ... (sisanya sama)
reportWebVitals();