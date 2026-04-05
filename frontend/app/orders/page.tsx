'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Order, OrderStatus } from '@/types';
import orderService from '@/services/order.service';
import { useAuth } from '@/context/AuthContext';

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDIENTE:
      return 'bg-yellow-100 text-yellow-800';
    case OrderStatus.ENVIADO:
      return 'bg-blue-100 text-blue-800';
    case OrderStatus.ENTREGADO:
      return 'bg-green-100 text-green-800';
    case OrderStatus.CANCELADO:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusIcon(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDIENTE:
      return '⏳';
    case OrderStatus.ENVIADO:
      return '📦';
    case OrderStatus.ENTREGADO:
      return '✅';
    case OrderStatus.CANCELADO:
      return '❌';
    default:
      return '📋';
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mis Pedidos</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tienes pedidos aún</p>
          <Link href="/products" className="text-blue-600 hover:underline">
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">Pedido #{order.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                  <p className="text-xl font-bold text-gray-800">
                    ${Number(order.totalAmount).toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3 ml-16 sm:ml-0">
                {order.items.length} producto(s)
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
