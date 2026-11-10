import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 1,
    full_name: 'Dr. Rajesh Kumar Sharma (Super Admin)',
    email: 'admin@bhoominiti.gov.in',
    role: 'super_admin',
    organization: 'Ministry of Rural Development'
  });
  const [loading, setLoading] = useState(false);

  const fetchMe = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.warn('Using default demo authenticated session');
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const switchRole = async (targetRole) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/switch-role', { target_role: targetRole });
      if (res.data.access_token) {
        localStorage.setItem('bhoominiti_token', res.data.access_token);
      }
      setUser(res.data.user);
    } catch (err) {
      // Fallback local state update
      setUser(prev => ({ ...prev, role: targetRole }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, switchRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
