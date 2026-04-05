'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import localCartService from '@/services/localCart.service';
import cartService from '@/services/cart.service';
import axios from 'axios';

export default function FloatingCart() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [itemCount, setItemCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const updateCount = async () => {
      try {
        if (isAuthenticated) {
          const items = await cartService.getCart();
          const count = items.length;
          setItemCount(count);
        } else {
          const localCart = localCartService.getCart();
          const count = localCart.length;
          setItemCount(count);
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setItemCount(0);
          return;
        }
        console.error('Error getting cart count:', err);
        setItemCount(0);
      }
    };

    updateCount();
    
    const handleCartUpdate = () => updateCount();
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, [isAuthenticated, mounted]);

  if (!mounted) {
    return null;
  }

  if (pathname === '/cart' || pathname?.startsWith('/admin')) {
    return null;
  }

  if (itemCount === 0) {
    return null;
  }

  return (
    <Link
      href="/cart"
      className="fixed bottom-6 right-6 z-[100] group"
    >
      <div className="relative">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-7 sm:h-7 bg-red-500 text-white text-xs sm:text-sm font-bold rounded-full flex items-center justify-center shadow-md">
          {itemCount}
        </div>
      </div>
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Ver carrito
      </span>
    </Link>
  );
}