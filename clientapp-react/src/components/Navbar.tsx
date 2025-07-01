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
    } catch (e: any) {
      // No setError aquí, el error se maneja en RegisterModal
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

  // Detectar expiración de sesión (401 global)
  React.useEffect(() => {
    const handle401 = (event: any) => {
      if (event.detail && event.detail.status === 401) {
        setError('Your session has expired. Please log in again.');
        logout();
        setLoginOpen(true);
      }
    };
    window.addEventListener('session-expired', handle401);
    return () => window.removeEventListener('session-expired', handle401);
  }, [logout]);

  return (
    <nav className="bg-tangoGreen-dark text-white shadow-md py-1 px-4 flex items-center justify-between flex-row min-h-[40px]">
      <div className="flex items-center gap-1">
        <a href="/" className="font-bold text-lg tracking-wide hover:text-tangoGold transition leading-tight">TangoEvents</a>
      </div>
      <div className="flex gap-2 text-sm items-center ml-2">
        {user ? (
          <>
            <span className="font-semibold">Welcome!</span>
            <button onClick={handleLogout} className="hover:text-tangoGold transition px-1 py-0.5 text-sm">Logout</button>
          </>
        ) : (
          <>
            <button onClick={handleOpenRegister} className="hover:text-tangoGold transition bg-transparent border-none px-1 py-0.5 text-sm">Register</button>
            <button onClick={handleOpenLogin} className="hover:text-tangoGold transition bg-transparent border-none px-1 py-0.5 text-sm">Login</button>
          </>
        )}
      </div>
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} onLogin={handleLogin} />
      <RegisterModal isOpen={registerOpen} onClose={() => setRegisterOpen(false)} onRegister={handleRegister} />
    </nav>
  );
};

export default Navbar;
