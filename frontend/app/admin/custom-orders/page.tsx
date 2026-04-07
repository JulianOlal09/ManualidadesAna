'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { CustomOrder, CustomOrderStatus } from '@/types';

interface CustomOrderWithUser extends CustomOrder {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
}

export default function AdminCustomOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  
  const [customOrders, setCustomOrders] = useState<CustomOrderWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
    if (!authLoading && isAuthenticated && !isAdmin) router.push('/products');
    if (isAdmin) fetchCustomOrders();
  }, [isAuthenticated, isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) fetchCustomOrders();
  }, [currentPage, filterStatus, isAdmin]);

  const fetchCustomOrders = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/pedido-personalizado/admin/all`,
        {
          params: {
            page: currentPage,
            limit: 25,
            status: filterStatus === 'ALL' ? undefined : filterStatus,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setCustomOrders(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      }
    } catch (err: any) {
      console.error('Error fetching custom orders:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.error?.message || err.message || 'Error al cargar pedidos personalizados';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/pedido-personalizado/admin/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Estado del pedido actualizado correctamente');
      fetchCustomOrders();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al actualizar estado');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONTACTED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'CONTACTED': return 'Contactado';
      case 'COMPLETED': return 'Completado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  if (authLoading || isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-gray-500">Cargando...</div></div>;
  }

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Gestión de Pedidos Personalizados</h1>
      </div>

      {error && <div className="mb-3 md:mb-4 p-3 bg-red-50 text-red-600 rounded-md text-xs md:text-sm">{error}</div>}
      {success && <div className="mb-3 md:mb-4 p-3 bg-green-50 text-green-600 rounded-md text-xs md:text-sm">{success}</div>}

      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label className="text-xs md:text-sm font-medium text-gray-700">Filtrar por estado:</label>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as CustomOrderStatus | 'ALL');
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="ALL">Todos</option>
          <option value="PENDING">Pendientes</option>
          <option value="CONTACTED">Contactados</option>
          <option value="COMPLETED">Completados</option>
          <option value="CANCELLED">Cancelados</option>
        </select>
        <span className="text-xs md:text-sm text-gray-500">
          {customOrders.length} de {total} pedido(s)
        </span>
      </div>

      <div className="grid gap-3 md:gap-4">
        {customOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800">Pedido Personalizado #{order.id}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 mt-1 break-words">
                  Cliente: {order.user.name} ({order.user.email})
                </p>
                {order.user.phone && (
                  <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                    Teléfono: {order.user.phone}
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
            </div>

            <div className="border-t border-gray-100 pt-2 md:pt-3 mb-2 md:mb-3">
              <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Mensaje del cliente:</h4>
              <p className="text-xs md:text-sm text-gray-600 whitespace-pre-wrap break-words">
                {order.message}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 md:pt-3 border-t border-gray-100">
              <label className="text-xs md:text-sm font-medium text-gray-700">Cambiar estado:</label>
              <select
                value={order.status}
                onChange={(e) => handleUpdateStatus(order.id, e.target.value as CustomOrderStatus)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="PENDING">Pendiente</option>
                <option value="CONTACTED">Contactado</option>
                <option value="COMPLETED">Completado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {customOrders.length === 0 && !isLoading && (
        <p className="text-gray-500 text-center py-6 md:py-8 text-sm md:text-base">No hay pedidos personalizados con el filtro seleccionado.</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 md:mt-6 px-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 md:px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm md:text-base hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const showPage = 
                page === 1 || 
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1);
              
              if (!showPage) {
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-1 md:px-2 text-gray-400 text-sm">...</span>;
                }
                return null;
              }
              
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-lg text-sm md:text-base transition-colors ${
                    page === currentPage
                      ? 'bg-pink-600 text-white font-medium'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 md:px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm md:text-base hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <p className="text-center text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
          Mostrando {((currentPage - 1) * 25) + 1} - {Math.min(currentPage * 25, total)} de {total} pedidos
        </p>
      )}
    </div>
  );
}
