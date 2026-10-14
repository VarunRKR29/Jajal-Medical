import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types.js';
import { api, getStoredToken } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRoleQuick: (role: UserRole) => Promise<void>;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isAdmin: boolean;
  isViewer: boolean;
  isEngineer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize or restore session
  useEffect(() => {
    async function loadUser() {
      const stored = getStoredToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.getCurrentUser();
        if (res.success && res.data) {
          setUser(res.data);
          setToken(stored);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch {
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const switchRoleQuick = async (role: UserRole) => {
    const credentials = {
      admin: { email: 'admin@jajalmedical.com', pass: 'Password123!' },
      viewer: { email: 'viewer@jajalmedical.com', pass: 'Password123!' },
      engineer: { email: 'engineer@jajalmedical.com', pass: 'Password123!' },
    }[role];

    await login(credentials.email, credentials.pass);
  };

  const isAdmin = user?.role === 'admin';
  const isViewer = user?.role === 'viewer';
  const isEngineer = user?.role === 'engineer';

  const canCreate = isAdmin || isEngineer;
  const canEdit = isAdmin || isEngineer;
  const canDelete = isAdmin; // Delete is strictly Admin only

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        switchRoleQuick,
        canCreate,
        canEdit,
        canDelete,
        isAdmin,
        isViewer,
        isEngineer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
