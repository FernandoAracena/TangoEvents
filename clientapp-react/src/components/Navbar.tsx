import React, { useState } from 'react';
import LoginModal from '../LoginModal';
import RegisterModal from '../RegisterModal';
import { useUser } from '../UserContext';

const Navbar: React.FC = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const { user, login, register, logout } = useUser();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      setLoginOpen(false);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Login failed');
    }
  };
  const handleRegister = async (email: string, password: string) => {
    try {
      await register(email, password);
      setRegisterOpen(false);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Registration failed');
    }
  };
  const handleLogout = () => {
    logout();
  };
  const handleOpenLogin = () => {
    setRegisterOpen(false);
    setLoginOpen(true);
  };
  const handleOpenRegister = () => {
    setLoginOpen(false);
    setRegisterOpen(true);
  };

  return (
    <nav className="bg-tangoGreen-dark text-white shadow-md py-3 px-6 flex items-center justify-between flex-row">
      <div className="flex items-center gap-2">
        <a href="/" className="font-bold text-xl tracking-wide hover:text-tangoGold transition">TangoEvents</a>
      </div>
      <div className="flex gap-4 text-base items-center ml-4">
        {user ? (
          <>
            <span className="font-semibold">Welcome!</span>
            <button onClick={handleLogout} className="hover:text-tangoGold transition">Logout</button>
          </>
        ) : (
          <>
            <button onClick={handleOpenRegister} className="hover:text-tangoGold transition bg-transparent border-none">Register</button>
            <button onClick={handleOpenLogin} className="hover:text-tangoGold transition bg-transparent border-none">Login</button>
          </>
        )}
      </div>
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} onLogin={handleLogin} />
      <RegisterModal isOpen={registerOpen} onClose={() => setRegisterOpen(false)} onRegister={handleRegister} />
      {error && <div className="text-red-500 text-sm absolute top-2 right-2">{error}</div>}
    </nav>
  );
};

export default Navbar;
