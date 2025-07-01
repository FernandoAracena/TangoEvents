import React from 'react';
import Router from './router';
import { UserProvider } from './UserContext';
import Navbar from './components/Navbar';

interface AppProps {
  children: React.ReactNode;
}

const App: React.FC<AppProps> = ({ children }) => {
  return (
    <UserProvider>
      <div className="App bg-tangoWhite min-h-screen">
        <Navbar />
        <main className="pt-12 md:pt-16">
          <Router />
          {children}
        </main>
      </div>
    </UserProvider>
  );
};

export default App;
