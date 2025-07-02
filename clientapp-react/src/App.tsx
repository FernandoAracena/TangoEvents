import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import useGAPageView from './useGAPageView';

const App: React.FC = () => {
  useGAPageView();
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
