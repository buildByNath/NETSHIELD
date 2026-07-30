import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { SimulationProvider } from './context/SimulationContext.jsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SimulationProvider>
      <App />
    </SimulationProvider>
  </React.StrictMode>
);
