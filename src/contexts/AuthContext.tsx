import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthResponse } from '../types';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  authToken: string | null;
  authMessage: string | null;
  login: (data: AuthResponse, isPhotographer: boolean) => void;
  logout: () => void;
  setRedirectPath: (path: string) => void;
  setAuthMessage: (message: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserDetails = async (token: string, isPhotographer: boolean) => {
    try {
      const endpoint = isPhotographer
        ? 'https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/photographer/mydetails'
        : 'https://xk7b-zmzz-makv.p7.xano.io/api:a9yee6L7/surfer/mydetails';

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is expired or invalid
          setAuthMessage('Your session has expired, please log in again.');
          logout();
          return;
        }
        throw new Error('Failed to fetch user details');
      }

      const userData = await response.json();
      const userWithType = { ...userData, isPhotographer };
      setUser(userWithType);
      localStorage.setItem('user', JSON.stringify(userWithType));
      
      // Check if there's a redirect path stored
      const storedRedirectPath = localStorage.getItem('redirectPath') || redirectPath;
      
      if (storedRedirectPath) {
        // Clear the stored redirect path
        localStorage.removeItem('redirectPath');
        setRedirectPath(null);
        // Navigate to the intended destination
        navigate(storedRedirectPath);
      } else {
        // Default redirect based on user type
        if (isPhotographer) {
          navigate('/photographerprofile/stats');
        } else {
          navigate('/surfer/media');
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      logout();
    }
  };

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setAuthToken(storedToken);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }, []);

  const login = async (data: AuthResponse, isPhotographer: boolean) => {
    setAuthToken(data.authToken);
    localStorage.setItem('authToken', data.authToken);
    await fetchUserDetails(data.authToken, isPhotographer);
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    setRedirectPath(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('redirectPath');
    navigate('/');
  };

  const setRedirectPathHandler = (path: string) => {
    setRedirectPath(path);
    localStorage.setItem('redirectPath', path);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      authToken, 
      authMessage,
      login, 
      logout, 
      setRedirectPath: setRedirectPathHandler,
      setAuthMessage
    }}>
      {children}
    </AuthContext.Provider>
  );
};