import { createContext, useContext, useMemo, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (username, password) => {
    setLoading(true);
    try {
      const response = await authService.login(username, password);
      setUser(response.user);
      setToken(response.token || response.access_token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch (_) {
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const value = useMemo(() => ({
    user,
    token,
    loading,
    signIn,
    signOut
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
