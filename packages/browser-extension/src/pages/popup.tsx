/**
 * Popup Entry Point
 * Renders the main app in the extension popup
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '../App';
import '../styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
