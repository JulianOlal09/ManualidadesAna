'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <nav className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 shadow-md border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 shadow-md border-b border-pink-100 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity py-1">
            <Image 
              src="/logo.png" 
              alt="Manualidades Ana" 
              width={140} 
              height={45}
              className="object-contain h-12 w-auto sm:h-14"
              priority
            />
          </Link>

          {/* Menu Button - Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-white/50 rounded-lg"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/products"
              className="px-3 py-2 text-sm text-gray-700 hover:text-pink-600 hover:bg-white/50 rounded-lg transition-all duration-200 font-medium"
            >
              🛍️ Productos
            </Link>
            <Link
              href="/cart"
              className="px-3 py-2 text-sm text-gray-700 hover:text-pink-600 hover:bg-white/50 rounded-lg transition-all duration-200 font-medium"
            >
              🛒 Mi Carrito
            </Link>
            {isAuthenticated && !isAdmin && (
              <Link
                href="/orders"
                className="px-3 py-2 text-sm text-gray-700 hover:text-pink-600 hover:bg-white/50 rounded-lg transition-all duration-200 font-medium"
              >
                📦 Mis Pedidos
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="px-3 py-2 text-sm text-purple-700 hover:text-purple-900 hover:bg-white/50 rounded-lg transition-all duration-200 font-semibold"
              >
                ⚙️ Admin
              </Link>
            )}
          </div>

          {/* User Section - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-white/60 rounded-full">
                  <span className="text-lg">👋</span>
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-white/50 rounded-lg transition-all duration-200"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-pink-600 hover:bg-white/50 rounded-lg transition-all duration-200"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-sm font-semibold hover:from-pink-600 hover:to-purple-600 shadow-md transition-all duration-200"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-pink-100 py-3 space-y-2">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:bg-white/50 rounded-lg font-medium"
            >
              🛍️ Productos
            </Link>
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-700 hover:bg-white/50 rounded-lg font-medium"
            >
              🛒 Mi Carrito
            </Link>
            {isAuthenticated && !isAdmin && (
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-gray-700 hover:bg-white/50 rounded-lg font-medium"
              >
                📦 Mis Pedidos
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-purple-700 hover:bg-white/50 rounded-lg font-semibold"
              >
                ⚙️ Admin
              </Link>
            )}
            <div className="border-t border-pink-100 pt-2 mt-2">
              {isAuthenticated ? (
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="font-medium text-gray-700">👋 {user?.name}</span>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-center text-gray-700 hover:bg-white/50 rounded-lg"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-center bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
