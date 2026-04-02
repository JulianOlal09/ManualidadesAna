'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import localCartService, { LocalCartItem } from '@/services/localCart.service';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cart = localCartService.getCart();
    setItems(cart);
    setIsLoading(false);
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    localCartService.updateQuantity(productId, quantity);
    loadCart();
  };

  const handleRemoveItem = (productId: number) => {
    localCartService.removeItem(productId);
    loadCart();
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Guardar carrito antes de ir al login
      router.push('/login?redirect=/cart');
    } else {
      // Usuario autenticado, crear pedido
      router.push('/checkout');
    }
  };

  const total = localCartService.getTotal();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">🛒 Mi Carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const itemTotal = item.price * item.quantity;
            const isOutOfStock = item.stock === 0;
            const isLowStock = item.stock > 0 && item.stock <= 5;
            const exceedsStock = item.quantity > item.stock;

            return (
              <div
                key={item.productId}
                className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Imagen */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600 text-sm">
                      ${item.price.toFixed(2)} c/u
                    </p>
                    
                    {isOutOfStock && (
                      <p className="text-sm text-red-600 mt-1">⚠️ Sin stock</p>
                    )}
                    {!isOutOfStock && isLowStock && (
                      <p className="text-sm text-orange-600 mt-1">
                        ⚠️ Solo quedan {item.stock} unidades
                      </p>
                    )}
                    {exceedsStock && !isOutOfStock && (
                      <p className="text-sm text-red-600 mt-1">
                        ⚠️ Cantidad excede stock disponible ({item.stock})
                      </p>
                    )}

                    {/* Controles */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100"
                          disabled={isOutOfStock || item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Precio total */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-800">
                      ${itemTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen del Pedido</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>A calcular</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-xl font-bold text-gray-800">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 Inicia sesión para finalizar tu compra
                </p>
              </div>
            )}

            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
            >
              {isAuthenticated ? '✓ Confirmar Pedido' : '🔐 Iniciar Sesión y Comprar'}
            </button>

            <Link
              href="/products"
              className="block text-center text-gray-600 hover:text-gray-800 mt-4 text-sm"
            >
              ← Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
