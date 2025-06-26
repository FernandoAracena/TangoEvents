import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface UserContextType {
  user: { email: string } | null;
  token: string | null;
  setUser: (user: { email: string } | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Cargar usuario/token de localStorage
    const t = localStorage.getItem('jwt');
    const email = localStorage.getItem('email');
    if (t && email) {
      setToken(t);
      setUser({ email });
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('http://localhost:8080/api/AuthApi/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    setToken(data.token);
    setUser({ email: data.email });
    localStorage.setItem('jwt', data.token);
    localStorage.setItem('email', data.email);
  };

  const register = async (email: string, password: string) => {
    const res = await fetch('http://localhost:8080/api/AuthApi/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Email: email, Password: password })
    });
    if (!res.ok) {
      // Intentar mostrar el mensaje de error real del backend
      let msg = 'Registration failed';
      try {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].description) {
          msg = data.map((e: any) => e.description).join(' ');
        } else if (data && data.title) {
          msg = data.title;
        }
      } catch {}
      throw new Error(msg);
    }
    const data = await res.json();
    setToken(data.token);
    setUser({ email: data.email });
    localStorage.setItem('jwt', data.token);
    localStorage.setItem('email', data.email);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('email');
  };

  return (
    <UserContext.Provider value={{ user, token, setUser, setToken, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
