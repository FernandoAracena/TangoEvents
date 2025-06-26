import React from 'react';
import Router from './router';
import { UserProvider } from './UserContext';

function App() {
  return (
    <UserProvider>
      <Router />
    </UserProvider>
  );
}

export default App;
