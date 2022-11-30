import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import applyAxiosDefaultHeaders from './util/util.axios';
import 'bootstrap/dist/css/bootstrap.min.css';

applyAxiosDefaultHeaders()
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
