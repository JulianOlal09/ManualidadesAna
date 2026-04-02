'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string, 10);
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && !isNaN(orderId)) {
      fetchOrder();
    }
  }, [isAuthenticated, authLoading, orderId, router]);

  const fetchOrder = async () => {
    try {
      const data = await orderService.getMyOrderById(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pedido');
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

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 mb-4">Pedido no encontrado</p>
        <Link href="/orders" className="text-blue-600 hover:underline">
          Volver a pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="text-gray-600 hover:text-gray-900 mb-4"
      >
        ← Volver
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pedido #{order.id}</h1>
            <p className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">Productos</h2>
      <div className="space-y-4 mb-8">
        {order.items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border p-4 flex gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
              {item.product?.imageUrl ? (
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <span className="text-2xl">📦</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">
                {item.product?.name || 'Producto'}
              </h3>
              {item.product?.sku && (
                <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
              )}
              <p className="text-sm text-gray-600">
                {item.quantity} x ${Number(item.priceAtPurchase || 0).toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-800">
                ${(item.quantity * Number(item.priceAtPurchase || 0)).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 max-w-md ml-auto">
        <div className="space-y-2">
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span>${Number(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}