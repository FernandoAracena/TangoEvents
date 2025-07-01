import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import EventsList from './EventsList';
import NotFound from './components/NotFound';
import reportWebVitals from './reportWebVitals';
import { UserProvider } from './UserContext';

const root = ReactDOM.createRoot(
  document.getElementById('root')
);
root.render(
  <React.StrictMode>
    <UserProvider>
      <Router>
        <App> 
          <Routes>
            <Route path="/" element={<EventsList />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </App>
      </Router>
    </UserProvider>
  </React.StrictMode>
);

reportWebVitals();
