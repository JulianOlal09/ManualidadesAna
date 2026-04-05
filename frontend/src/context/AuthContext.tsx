'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Role } from '@/types';
import authService from '@/services/auth.service';
import localCartService from '@/services/localCart.service';
import cartService from '@/services/cart.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function migrateLocalCartToServer() {
  const localCart = localCartService.getCart();
  if (localCart.length === 0) return;

  for (const item of localCart) {
    try {
      await cartService.addItem({
        productId: item.productId,
        quantity: item.quantity,
      });
    } catch (err) {
      console.error('Error migrating cart item:', err);
    }
  }

  localCartService.clearCart();
  
  window.dispatchEvent(new CustomEvent('cart-updated'));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser) as User;
        setUser(userData);
        
        await authService.me();
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Login attempt:', email);
    const response = await authService.login({ email, password });
    console.log('Login response:', response);
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);

    await migrateLocalCartToServer();
    window.dispatchEvent(new CustomEvent('cart-updated'));

    // Redirigir al admin si es admin
    if (response.user.role === 'ADMIN') {
      window.location.href = '/admin';
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await authService.register({ email, password, name });
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);

    await migrateLocalCartToServer();
    window.dispatchEvent(new CustomEvent('cart-updated'));

    // Redirigir al admin si es admin
    if (response.user.role === 'ADMIN') {
      window.location.href = '/admin';
    }
  };

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    window.dispatchEvent(new CustomEvent('cart-updated'));
    window.location.href = '/';
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === Role.ADMIN;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}