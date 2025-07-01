import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  return (
    <div className="App bg-tangoWhite min-h-screen">
      <Navbar />
      <main className="pt-12 md:pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
