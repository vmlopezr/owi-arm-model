import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.scss';
document.body.style.overflow = 'hidden';
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
