import React, { createContext, useContext, useEffect, useState } from 'react';

type User = {
  name?: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sgt_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const signIn = async (email: string) => {
    // Fake auth for local dev — replace with real API call later
    const u: User = { email, name: email.split('@')[0] };
    persist(u);
  };

  const signUp = async (name: string, email: string) => {
    // Fake registration
    const u: User = { email, name };
    persist(u);
  };

  const signOut = () => {
    persist(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
