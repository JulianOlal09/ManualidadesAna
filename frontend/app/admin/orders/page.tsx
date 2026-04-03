'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import orderService from '@/services/order.service';
import { Order, OrderStatus } from '@/types';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
    if (!authLoading && isAuthenticated && !isAdmin) router.push('/products');
    if (isAdmin) fetchOrders();
  }, [isAuthenticated, isAdmin, authLoading, router]);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    setError('');
    setSuccess('');
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setSuccess('Estado del pedido actualizado correctamente');
      fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estado');
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
      case 'ENVIADO': return 'bg-blue-100 text-blue-800';
      case 'ENTREGADO': return 'bg-green-100 text-green-800';
      case 'CANCELADO': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  if (authLoading || isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-gray-500">Cargando...</div></div>;
  }

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Gestión de Pedidos</h1>
      </div>

      {error && <div className="mb-3 md:mb-4 p-3 bg-red-50 text-red-600 rounded-md text-xs md:text-sm">{error}</div>}
      {success && <div className="mb-3 md:mb-4 p-3 bg-green-50 text-green-600 rounded-md text-xs md:text-sm">{success}</div>}

      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label className="text-xs md:text-sm font-medium text-gray-700">Filtrar por estado:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'ALL')}
          className="px-3 py-2 border rounded-md text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Todos</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="ENVIADO">Enviados</option>
          <option value="ENTREGADO">Entregados</option>
          <option value="CANCELADO">Cancelados</option>
        </select>
        <span className="text-xs md:text-sm text-gray-500">
          {filteredOrders.length} pedido(s)
        </span>
      </div>

      <div className="grid gap-3 md:gap-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800">Pedido #{order.id}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                {order.user && (
                  <p className="text-xs md:text-sm text-gray-600 mt-1 break-words">
                    Cliente: {order.user.name} ({order.user.email})
                  </p>
                )}
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  {new Date(order.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-lg md:text-xl font-bold text-gray-800">
                  ${Number(order.totalAmount).toFixed(2)}
                </p>
                <p className="text-xs md:text-sm text-gray-500">{order.items.length} producto(s)</p>
              </div>
            </div>

            <div className="border-t pt-2 md:pt-3 mb-2 md:mb-3">
              <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Productos:</h4>
              <div className="space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs md:text-sm gap-2">
                    <span className="text-gray-600 flex-1 break-words">
                      {item.product?.name || `Producto ID ${item.productId}`} × {item.quantity}
                    </span>
                    <span className="text-gray-800 font-medium whitespace-nowrap">
                      ${Number(item.priceAtPurchase || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 md:pt-3 border-t">
              <label className="text-xs md:text-sm font-medium text-gray-700">Cambiar estado:</label>
              <select
                value={order.status}
                onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                className="w-full sm:w-auto px-3 py-2 border rounded-md text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="ENVIADO">Enviado</option>
                <option value="ENTREGADO">Entregado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && !isLoading && (
        <p className="text-gray-500 text-center py-6 md:py-8 text-sm md:text-base">No hay pedidos con el filtro seleccionado.</p>
      )}
    </div>
  );
}
