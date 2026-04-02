'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import localCartService from '@/services/localCart.service';
import cartService from '@/services/cart.service';

export default function FloatingCart() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [count, setCount] = useState(0);

  const loadCount = async () => {
    try {
      if (isAuthenticated) {
        const cart = await cartService.getCart();
        setCount(cart.length);
      } else {
        const localCart = localCartService.getCart();
        setCount(localCart.length);
      }
    } catch (err) {
      const localCart = localCartService.getCart();
      setCount(localCart.length);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadCount();
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    const handleStorage = () => loadCount();
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(loadCount, 3000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  if (count === 0) return null;

  return (
    <Link href="/cart" className="fixed bottom-4 right-4 z-50 md:hidden">
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2">
        <span className="text-xl">🛒</span>
        <span className="font-semibold">{count}</span>
      </div>
    </Link>
  );
}
