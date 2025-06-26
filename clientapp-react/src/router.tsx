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
