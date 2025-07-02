import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  return (
    <div className="App bg-tangoWhite min-h-screen">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
