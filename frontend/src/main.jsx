import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#020f02',
          color: '#00ff41',
          border: '1px solid rgba(0,255,65,.3)',
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: '13px',
          letterSpacing: '1px',
        },
        success: { iconTheme: { primary: '#00ff41', secondary: '#000' } },
        error:   { iconTheme: { primary: '#ff0030', secondary: '#000' } },
      }}
    />
  </React.StrictMode>
);
