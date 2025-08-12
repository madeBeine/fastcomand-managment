import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserPermissions, LoginCredentials, AuthResponse } from '../../shared/types';

interface AuthContextType {
  user: User | null;
  permissions: UserPermissions | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Check if user is already logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await window.fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          setPermissions(data.permissions);
        } else {
          localStorage.removeItem('authToken');
        }
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      // Prevent concurrent login attempts
      if (isLoggingIn) {
        console.log('🔄 Login already in progress, skipping...');
        return {
          success: false,
          message: 'عملية تسجيل الدخول قيد ال��نفيذ...'
        };
      }

      setIsLoggingIn(true);
      console.log('🔐 Starting login process...');

      // Create AbortController to prevent duplicate requests
      const controller = new AbortController();

      // Set timeout for request
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

      const response = await window.fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'حدث خطأ أثناء تسجيل الدخول'
        };
      }

      const data: AuthResponse = await response.json();

      if (data.success && data.user && data.token) {
        setUser(data.user);
        localStorage.setItem('authToken', data.token);
        
        // Get permissions
        const permissionsResponse = await window.fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        });
        
        if (permissionsResponse.ok) {
          const permissionsData = await permissionsResponse.json();
          setPermissions(permissionsData.permissions);
        }
      }

      return data;
    } catch (error) {
      console.error('Login failed:', error);

      // More specific error handling
      if (error instanceof TypeError && error.message.includes('body stream')) {
        console.error('Body stream error - possible duplicate request');
        return {
          success: false,
          message: 'حدث خطأ في معالجة الطلب. يرجى إعادة المحاولة.'
        };
      }

      return {
        success: false,
        message: 'حدث خطأ في الاتصال بالخادم'
      };
    } finally {
      setIsLoggingIn(false);
      console.log('🔐 Login process completed');
    }
  };

  const logout = async () => {
    // Log logout operation before clearing user data
    if (user) {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          await window.fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userName: user.name,
              userRole: user.role
            })
          });
        }
      } catch (error) {
        console.error('Error logging logout:', error);
      }
    }

    setUser(null);
    setPermissions(null);
    localStorage.removeItem('authToken');
  };

  const value: AuthContextType = {
    user,
    permissions,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
