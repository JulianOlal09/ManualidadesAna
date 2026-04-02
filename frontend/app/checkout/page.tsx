'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import localCartService from '@/services/localCart.service';
import cartService from '@/services/cart.service';
import orderService from '@/services/order.service';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }

    if (isAuthenticated) {
      syncCartToServer();
    }
  }, [isAuthenticated, authLoading, router]);

  const syncCartToServer = async () => {
    try {
      const localCart = localCartService.getCart();
      
      if (localCart.length > 0) {
        // Migrar carrito local al servidor
        for (const item of localCart) {
          await cartService.addItem({
            productId: item.productId,
            quantity: item.quantity,
          });
        }
        
        // Limpiar carrito local
        localCartService.clearCart();
      }
    } catch (err) {
      console.error('Error syncing cart:', err);
    }
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const order = await orderService.createOrder();
      setSuccess(`¡Pedido #${order.id} creado exitosamente!`);
      
      setTimeout(() => {
        router.push(`/orders/${order.id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear pedido');
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        ✓ Confirmar Pedido
      </h1>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Tu pedido está listo
        </h2>
        <p className="text-gray-600 mb-6">
          Al confirmar, tu pedido será procesado y recibirás un número de seguimiento.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm font-medium">{success}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleConfirmOrder}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-md hover:shadow-lg"
          >
            {isProcessing ? '⏳ Procesando...' : '✓ Confirmar y Crear Pedido'}
          </button>

          <Link
            href="/cart"
            className="block w-full text-center py-3 text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Volver al carrito
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Una vez confirmado el pedido, se descontará el stock de los productos automáticamente.
        </p>
      </div>
    </div>
  );
}
