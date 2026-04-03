'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import inventoryService, { 
  ProductWithCategory, 
  InventoryStats, 
  InventoryFilters,
  PaginatedInventory 
} from '@/services/inventory.service';
import { Category } from '@/types';
import { categoryService } from '@/services/product.service';

function getStockColor(stock: number): string {
  if (stock === 0) return 'bg-red-100 text-red-800';
  if (stock <= 5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
}

function getStockLabel(stock: number): string {
  if (stock === 0) return 'Sin stock';
  if (stock <= 5) return 'Stock bajo';
  return 'En stock';
}

export default function InventoryPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  
  const [inventoryData, setInventoryData] = useState<PaginatedInventory | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    categoryId: undefined,
    stockStatus: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState(1);
  const [adjustOperation, setAdjustOperation] = useState<'add' | 'set'>('add');
  const [isAdjusting, setIsAdjusting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/products');
      return;
    }

    if (isAdmin) {
      fetchCategories();
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  const fetchCategories = async () => {
    try {
      const cats = await categoryService.getAll();
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    if (isAdmin && categories.length > 0) {
      fetchData();
    }
  }, [isAdmin, categories, filters, currentPage]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [inventoryResult, statsData] = await Promise.all([
        inventoryService.getAll(filters, currentPage, 25),
        inventoryService.getStats(),
      ]);
      setInventoryData(inventoryResult);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar inventario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<InventoryFilters>) => {
    setFilters({ ...filters, ...newFilters });
    setCurrentPage(1);
  };

  const handleAdjustStock = async (productId: number) => {
    setIsAdjusting(true);
    setError('');
    setSuccess('');

    try {
      await inventoryService.adjustStock(productId, {
        quantity: adjustQuantity,
        operation: adjustOperation,
      });
      setSuccess('Stock actualizado correctamente');
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al ajustar stock');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (inventoryData?.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const inventory = inventoryData?.data || [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Gestión de Inventario</h1>
      </div>

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

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-500">Total productos</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-500">Sin stock</p>
            <p className="text-xl md:text-2xl font-bold text-red-600">{stats.outOfStock}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-500">Stock bajo</p>
            <p className="text-xl md:text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-500">En stock</p>
            <p className="text-xl md:text-2xl font-bold text-green-600">{stats.inStock}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4 mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="w-full px-3 md:px-4 py-2 border rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[150px]">
            <select
              value={filters.categoryId || ''}
              onChange={(e) => handleFilterChange({ categoryId: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 md:px-4 py-2 border rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[150px]">
            <select
              value={filters.stockStatus}
              onChange={(e) => handleFilterChange({ stockStatus: e.target.value as InventoryFilters['stockStatus'] })}
              className="w-full px-3 md:px-4 py-2 border rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">Todos</option>
              <option value="out">Sin stock</option>
              <option value="low">Stock bajo</option>
              <option value="in">En stock</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Producto
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap hidden sm:table-cell">
                  Categoría
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap hidden lg:table-cell">
                  SKU
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap hidden md:table-cell">
                  Precio
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Stock
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap hidden md:table-cell">
                  Estado
                </th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 md:px-6 py-6 md:py-8 text-center text-sm text-gray-500">
                    No se encontraron productos con los filtros aplicados
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-800 max-w-[150px] md:max-w-none truncate">
                      {item.name}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 hidden sm:table-cell">
                      {item.category?.name || '-'}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 hidden lg:table-cell">
                      {item.sku || '-'}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-800 hidden md:table-cell whitespace-nowrap">
                      ${item.price ? Number(item.price).toFixed(2) : '-'}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockColor(item.stock)}`}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 hidden md:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockColor(item.stock)}`}>
                        {getStockLabel(item.stock)}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      {editingId === item.id ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 min-w-[200px]">
                          <input
                            type="number"
                            min="0"
                            value={adjustQuantity}
                            onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
                            className="w-full sm:w-16 px-2 py-1 border rounded text-xs md:text-sm"
                          />
                          <select
                            value={adjustOperation}
                            onChange={(e) => setAdjustOperation(e.target.value as 'add' | 'set')}
                            className="w-full sm:w-auto px-2 py-1 border rounded text-xs md:text-sm"
                          >
                            <option value="add">Agregar</option>
                            <option value="set">Establecer</option>
                          </select>
                          <div className="flex gap-1 w-full sm:w-auto">
                            <button
                            onClick={() => handleAdjustStock(item.id)}
                            disabled={isAdjusting}
                            className="flex-1 sm:flex-none px-2 py-1 bg-pink-600 text-white rounded text-xs md:text-sm hover:bg-pink-700 disabled:opacity-50"
                          >
                            {isAdjusting ? '...' : 'OK'}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex-1 sm:flex-none px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs md:text-sm hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(item.id);
                            setAdjustQuantity(1);
                            setAdjustOperation('add');
                          }}
                          className="text-pink-600 hover:text-pink-800 text-xs md:text-sm font-medium whitespace-nowrap"
                        >
                          Ajustar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {inventoryData && inventoryData.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 md:mt-6 px-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 md:px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm md:text-base hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: inventoryData.totalPages }, (_, i) => i + 1).map((page) => {
              const showPage = 
                page === 1 || 
                page === inventoryData.totalPages ||
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
            disabled={currentPage === inventoryData.totalPages}
            className="px-3 md:px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm md:text-base hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}

      {inventoryData && (
        <p className="text-center text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
          Mostrando {((currentPage - 1) * 25) + 1} - {Math.min(currentPage * 25, inventoryData.total)} de {inventoryData.total} productos
        </p>
      )}
    </div>
  );
}