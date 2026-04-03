'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const openLogin = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  // Ocultar navbar si el usuario es admin Y está en rutas de admin
  if (isAdmin && pathname?.startsWith('/admin')) {
    return null;
  }

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
    <>
      <nav className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 shadow-md border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center py-1 flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="Manualidades Ana" 
                width={180}
                height={60}
                className="w-auto h-14 sm:h-16"
                priority
              />
            </Link>

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

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/products"
                className="px-4 py-2.5 text-base text-gray-700 hover:text-pink-600 hover:bg-white/50 rounded-lg transition-all duration-200 font-medium"
              >
                🛍️ Productos
              </Link>
              <Link
                href="/cart"
                className="px-4 py-2.5 text-base text-gray-700 hover:text-pink-600 hover:bg-white/50 rounded-lg transition-all duration-200 font-medium"
              >
                🛒 Mi Carrito
              </Link>
              {isAuthenticated && !isAdmin && (
                <Link
                  href="/orders"
                  className="px-4 py-2.5 text-base text-gray-700 hover:text-pink-600 hover:bg-white/50 rounded-lg transition-all duration-200 font-medium"
                >
                  📦 Mis Pedidos
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-4 py-2.5 text-base text-purple-700 hover:text-purple-900 hover:bg-white/50 rounded-lg transition-all duration-200 font-semibold"
                >
                  ⚙️ Admin
                </Link>
              )}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/60 rounded-full hover:bg-white/80 transition-colors text-base font-medium text-gray-700"
                  >
                    <span className="text-lg">👋</span>
                    {user?.name}
                  </Link>
                  <button
                    onClick={logout}
                    className="px-4 py-2.5 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-white/50 rounded-lg transition-all duration-200"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={openLogin}
                    className="px-5 py-2.5 text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-white/50 rounded-lg transition-all duration-200"
                  >
                    Iniciar sesión
                  </button>
                  <button
                    onClick={openRegister}
                    className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-base font-semibold hover:from-pink-600 hover:to-purple-600 shadow-md transition-all duration-200"
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-pink-100 py-4">
              <div className="space-y-2">
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-white/50 rounded-lg font-medium text-lg"
                >
                  🛍️ Productos
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-white/50 rounded-lg font-medium text-lg"
                >
                  🛒 Mi Carrito
                </Link>
                {isAuthenticated && !isAdmin && (
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-white/50 rounded-lg font-medium text-lg"
                  >
                    📦 Mis Pedidos
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-purple-700 hover:bg-white/50 rounded-lg font-semibold text-lg"
                  >
                    ⚙️ Admin
                  </Link>
                )}
              </div>
              <div className="border-t border-pink-100 pt-4 mt-4">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-white/50 rounded-lg font-medium text-lg"
                    >
                      👤 {user?.name}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-lg text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Salir
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openLogin();
                      }}
                      className="block w-full px-4 py-3 text-center text-gray-700 hover:bg-white/50 rounded-lg font-medium text-lg"
                    >
                      Iniciar sesión
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openRegister();
                      }}
                      className="block w-full px-4 py-3 text-center bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold text-lg"
                    >
                      Registrarse
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
}