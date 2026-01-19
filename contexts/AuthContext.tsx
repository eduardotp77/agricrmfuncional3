
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<string | null>; // Returns 2FA code or error
  verify2FA: (code: string, email: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_EMAIL = 'agronaturex.com1@gmail.com';
const STORAGE_KEY = 'agri_session_v3';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tempToken, setTempToken] = useState<{ email: string, code: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsedUser = JSON.parse(saved) as User;
      
      // REPARACIÓN CRÍTICA: Forzar privilegio Master si el email coincide, incluso desde caché
      if (parsedUser.email.toLowerCase() === MASTER_EMAIL) {
        parsedUser.role = 'master_admin';
      }
      
      setUser(parsedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<string | null> => {
    // Generación de desafío 2FA
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    setTempToken({ email, code: mockCode });
    
    // Simular latencia de servidor de autenticación
    await new Promise(r => setTimeout(r, 600));
    
    console.log(`[SECURITY-AUDIT] Desafío 2FA generado para ${email}: ${mockCode}`);
    return mockCode;
  };

  const verify2FA = async (code: string, email: string): Promise<boolean> => {
    if (!tempToken || tempToken.code !== code || tempToken.email !== email) {
      return false;
    }

    const isMasterIdentity = email.toLowerCase() === MASTER_EMAIL;
    
    const loggedUser: User = {
      id: isMasterIdentity ? 'ROOT-001' : `u-${Date.now()}`,
      email: email,
      name: isMasterIdentity ? 'Administrator Master' : email.split('@')[0],
      role: isMasterIdentity ? 'master_admin' : 'kam_junior',
      status: 'active',
      lastLogin: new Date().toISOString()
    };

    setUser(loggedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser));
    setTempToken(null);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload(); 
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, verify2FA, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
