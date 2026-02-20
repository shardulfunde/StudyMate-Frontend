import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { CapabilityProvider } from './context/CapabilityContext';
import { ToastProvider } from './context/ToastContext'; // If you use toasts
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <CapabilityProvider>
    <ToastProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ToastProvider>
  </CapabilityProvider>
);
