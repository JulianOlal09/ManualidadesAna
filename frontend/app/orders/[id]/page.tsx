'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Order, OrderStatus, Product } from '@/types';
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

interface OrderItemWithProduct {
  id: number;
  orderId: number;
  productId: number | null;
  quantity: number;
  priceAtPurchase: number | null;
  product?: Product;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string, 10);
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedItems, setEditedItems] = useState<OrderItemWithProduct[]>([]);

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
      setEditedItems([...data.items]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pedido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updated = [...editedItems];
    updated[index] = { ...updated[index], quantity: newQuantity };
    setEditedItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = editedItems.filter((_, i) => i !== index);
    setEditedItems(updated);
  };

  const handleSaveChanges = async () => {
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const items = editedItems
        .filter(item => item.productId)
        .map(item => ({
          productId: item.productId!,
          quantity: item.quantity,
        }));

      await orderService.updateOrderItems(orderId, items);
      setSuccess('Pedido actualizado correctamente');
      setIsEditing(false);
      await fetchOrder();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar pedido';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar este pedido?')) return;

    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      await orderService.cancelOrder(orderId);
      setSuccess('Pedido cancelado correctamente');
      await fetchOrder();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cancelar pedido';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateTotal = () => {
    return editedItems.reduce((sum, item) => {
      return sum + (Number(item.priceAtPurchase || 0) * item.quantity);
    }, 0);
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

  const canEdit = order.status === OrderStatus.PENDIENTE;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.push('/orders')}
        className="text-gray-600 hover:text-gray-900 mb-4"
      >
        ← Volver a Mis Pedidos
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md text-sm">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
          <div className="flex flex-col items-end gap-3">
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
            >
              {order.status}
            </span>
            {canEdit && (
              <div className="flex flex-wrap gap-2 justify-end">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    ✏️ Editar Pedido
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isSaving ? 'Guardando...' : '💾 Guardar Cambios'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedItems([...order.items]);
                        setError('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancelar Edición
                    </button>
                  </>
                )}
                <button
                  onClick={handleCancelOrder}
                  disabled={isSaving}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors border border-red-200"
                >
                  {isSaving ? 'Cancelando...' : '🚫 Cancelar Pedido'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">Productos</h2>
      <div className="space-y-4 mb-8">
        {editedItems.map((item, index) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 flex gap-4 items-center">
            <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
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
              {isEditing ? (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleQuantityChange(index, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 flex items-center justify-center font-bold transition-colors"
                  >
                    −
                  </button>
                  <span className="font-semibold text-gray-800 w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(index, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 flex items-center justify-center font-bold transition-colors"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500 ml-2">
                    ${Number(item.priceAtPurchase || 0).toFixed(2)} c/u
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  {item.quantity} x ${Number(item.priceAtPurchase || 0).toFixed(2)}
                </p>
              )}
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <p className="font-semibold text-gray-800">
                ${(item.quantity * Number(item.priceAtPurchase || 0)).toFixed(2)}
              </p>
              {isEditing && (
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="px-3 py-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
                >
                  🗑️ Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
        {editedItems.length === 0 && isEditing && (
          <div className="text-center py-8 text-gray-500">
            No hay productos en el pedido
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 max-w-md ml-auto">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2">
            <span>Total</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}