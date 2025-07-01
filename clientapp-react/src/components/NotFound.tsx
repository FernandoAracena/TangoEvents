import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-tangoBlue">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-8">The page you are looking for does not exist.</p>
      <Link to="/" className="bg-tangoBlue text-white px-6 py-3 rounded hover:bg-tangoGold transition">
        Go back to the main page
      </Link>
    </div>
  );
};

export default NotFound;
