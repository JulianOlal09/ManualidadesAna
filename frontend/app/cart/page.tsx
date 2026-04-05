'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import localCartService, { LocalCartItem } from '@/services/localCart.service';
import cartService from '@/services/cart.service';
import { CartItem } from '@/types';
import AuthModal from '@/components/auth/AuthModal';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [localItems, setLocalItems] = useState<LocalCartItem[]>([]);
  const [serverItems, setServerItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      loadCart();
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    const handleCartUpdate = () => loadCart();
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, [isAuthenticated]);

  const loadCart = async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        const serverCart = await cartService.getCart();
        setServerItems(serverCart);
      } else {
        const cart = localCartService.getCart();
        setLocalItems(cart);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setServerItems([]);
        return;
      }
      console.error('Error loading cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantityLocal = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    localCartService.updateQuantity(productId, quantity);
    loadCart();
  };

  const handleRemoveItemLocal = (productId: number) => {
    localCartService.removeItem(productId);
    loadCart();
  };

  const handleUpdateQuantityServer = async (productId: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      await cartService.updateItem(productId, { quantity });
      loadCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const handleRemoveItemServer = async (productId: number) => {
    try {
      await cartService.removeItem(productId);
      loadCart();
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
    } else {
      router.push('/checkout');
    }
  };

  const localTotal = localCartService.getTotal();
  const serverTotal = serverItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
  const total = isAuthenticated ? serverTotal : localTotal;

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  const items = isAuthenticated ? serverItems : localItems;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">Agrega productos para comenzar tu compra</p>
          <Link
            href="/products"
            className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-md"
          >
            Ver Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">🛒 Mi Carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {isAuthenticated ? (
            serverItems.map((item) => {
              const itemTotal = Number(item.product.price) * item.quantity;
              const isOutOfStock = item.product.stock === 0;
              const isLowStock = item.product.stock > 0 && item.product.stock <= 5;
              const exceedsStock = item.quantity > item.product.stock;

              return (
                <div
                  key={item.productId}
                  className="bg-white rounded-lg shadow-sm p-3 sm:p-4"
                >
                  <div className="flex gap-2 sm:gap-4">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {(item.product.imageUrl1 || item.product.imageUrl2 || item.product.imageUrl3) ? (
                        <img
                          src={item.product.imageUrl1 || item.product.imageUrl2 || item.product.imageUrl3 || undefined}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-lg font-semibold text-gray-800 truncate">{item.product.name}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        ${Number(item.product.price).toFixed(2)} c/u
                      </p>
                      
                      {isOutOfStock && (
                        <p className="text-xs sm:text-sm text-red-600 mt-1">⚠️ Sin stock</p>
                      )}
                      {!isOutOfStock && isLowStock && (
                        <p className="text-xs sm:text-sm text-orange-600 mt-1">
                          ⚠️ Solo quedan {item.product.stock}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2 sm:mt-3">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => handleUpdateQuantityServer(item.productId, item.quantity - 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="w-8 sm:w-12 text-center text-sm sm:text-base font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantityServer(item.productId, item.quantity + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                            disabled={isOutOfStock || item.quantity >= item.product.stock}
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                          <p className="text-sm sm:text-lg font-bold text-gray-800">
                            ${itemTotal.toFixed(2)}
                          </p>
                          <button
                            onClick={() => handleRemoveItemServer(item.productId)}
                            className="text-red-600 hover:text-red-800 text-xs sm:text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            localItems.map((item) => {
              const itemTotal = item.price * item.quantity;
              const isOutOfStock = item.stock === 0;
              const isLowStock = item.stock > 0 && item.stock <= 5;
              const exceedsStock = item.quantity > item.stock;

              return (
                <div
                  key={item.productId}
                  className="bg-white rounded-lg shadow-sm p-3 sm:p-4"
                >
                  <div className="flex gap-2 sm:gap-4">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-lg font-semibold text-gray-800 truncate">{item.name}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        ${item.price.toFixed(2)} c/u
                      </p>
                      
                      {isOutOfStock && (
                        <p className="text-xs sm:text-sm text-red-600 mt-1">⚠️ Sin stock</p>
                      )}
                      {!isOutOfStock && isLowStock && (
                        <p className="text-xs sm:text-sm text-orange-600 mt-1">
                          ⚠️ Solo quedan {item.stock}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2 sm:mt-3">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => handleUpdateQuantityLocal(item.productId, item.quantity - 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="w-8 sm:w-12 text-center text-sm sm:text-base font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantityLocal(item.productId, item.quantity + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                            disabled={isOutOfStock || item.quantity >= item.stock}
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                          <p className="text-sm sm:text-lg font-bold text-gray-800">
                            ${itemTotal.toFixed(2)}
                          </p>
                          <button
                            onClick={() => handleRemoveItemLocal(item.productId)}
                            className="text-red-600 hover:text-red-800 text-xs sm:text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="lg:col-span-1 order-first lg:order-last">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-20">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Resumen</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm sm:text-base text-gray-600">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base text-gray-600">
                <span>Envío</span>
                <span>A calcular</span>
              </div>
            </div>

            <div className="border-t pt-3 sm:pt-4 mb-4 sm:mb-6">
              <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-800">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-800">
                  💡 Inicia sesión para finalizar
                </p>
              </div>
            )}

            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 sm:py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-md text-sm sm:text-base"
            >
              {isAuthenticated ? '✓ Confirmar Pedido' : '🔐 Iniciar Sesión'}
            </button>

            <Link
              href="/products"
              className="block text-center text-gray-600 hover:text-gray-800 mt-3 sm:mt-4 text-xs sm:text-sm"
            >
              ← Seguir comprando
            </Link>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
      />
    </div>
  );
}
