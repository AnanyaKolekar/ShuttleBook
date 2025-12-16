import { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, signup as apiSignup, me as apiMe, setAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      apiMe()
        .then((res) => setUser(res.user))
        .catch(() => {
          setToken('');
          setUser(null);
          setAuthToken(null);
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (payload) => {
    const res = await apiLogin(payload);
    setUser(res.user);
    setToken(res.token);
    setAuthToken(res.token);
    localStorage.setItem('token', res.token);
    return res.user;
  };

  const signup = async (payload) => {
    const res = await apiSignup(payload);
    setUser(res.user);
    setToken(res.token);
    setAuthToken(res.token);
    localStorage.setItem('token', res.token);
    return res.user;
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

