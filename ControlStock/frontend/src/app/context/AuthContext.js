import { createContext, useContext, useState } from 'react';
import { api } from '../services/api';
const AuthContext = createContext(undefined);
export function AuthProvider({
  children
}) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const login = async (usuario, password) => {
    setIsLoading(true);
    try {
      const response = await api.auth.login(usuario, password);
      setUser(response.user);
      setToken(response.token || response.access_token);
      localStorage.setItem('token', response.token || response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setIsLoading(false);
      return {
        success: true
      };
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Error de autenticación';
      return {
        success: false,
        error: errorMessage
      };
    }
  };
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };
  const updatePassword = async (oldPassword, newPassword) => {
    try {
      await api.auth.changePassword(oldPassword, newPassword);
      return true;
    } catch (error) {
      return false;
    }
  };
  const updateUser = (newUserData) => {
      setUser(newUserData);
      localStorage.setItem('user', JSON.stringify(newUserData));
  };
  return <AuthContext.Provider value={{
    user,
    token,
    login,
    logout,
    updatePassword,
    updateUser,
    isLoading
  }}>
      {children}
    </AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
