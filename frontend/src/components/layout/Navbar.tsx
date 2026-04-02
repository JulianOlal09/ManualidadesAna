'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <nav className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 shadow-md border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 shadow-md border-b border-pink-100 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity py-2">
            <Image 
              src="/logo.png" 
              alt="Manualidades Ana" 
              width={180} 
              height={60}
              className="object-contain h-16 w-auto"
              priority
            />
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/products"
              className="px-4 py-2 text-gray-700 hover:text-pink-600 hover:bg-white/50 rounded-lg transition-all duration-200 font-medium"
            >
              🛍️ Productos
            </Link>
            <Link
              href="/cart"
              className="px-4 py-2 text-gray-700 hover:text-pink-600 hover:bg-white/50 rounded-lg transition-all duration-200 font-medium"
            >
              🛒 Mi Carrito
            </Link>
            {isAuthenticated && !isAdmin && (
              <Link
                href="/orders"
                className="px-4 py-2 text-gray-700 hover:text-pink-600 hover:bg-white/50 rounded-lg transition-all duration-200 font-medium"
              >
                📦 Mis Pedidos
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="px-4 py-2 text-purple-700 hover:text-purple-900 hover:bg-white/50 rounded-lg transition-all duration-200 font-semibold"
              >
                ⚙️ Admin
              </Link>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full">
                  <span className="text-2xl">👋</span>
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-white/50 rounded-lg transition-all duration-200"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-pink-600 hover:bg-white/50 rounded-lg transition-all duration-200"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-sm font-semibold hover:from-pink-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}