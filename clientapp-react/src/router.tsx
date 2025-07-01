// This file is deprecated. Routing is now handled in index.js and App.tsx.
// Do not use this file. It is kept only for reference and should be deleted in the future.

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EventsList from './EventsList';
import CreateEvent from './CreateEvent';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const Router: React.FC = () => (
  <BrowserRouter>
    <div className="App min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<EventsList />} />
          <Route path="/create" element={<CreateEvent />} />
        </Routes>
      </main>
      <Footer />
    </div>
  </BrowserRouter>
);

export default Router;
