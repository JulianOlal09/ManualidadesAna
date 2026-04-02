'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import inventoryService, { ProductWithCategory, InventoryStats } from '@/services/inventory.service';

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
  
  const [inventory, setInventory] = useState<ProductWithCategory[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
      fetchData();
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  const fetchData = async () => {
    try {
      const [inventoryData, statsData] = await Promise.all([
        inventoryService.getAll(),
        inventoryService.getStats(),
      ]);
      setInventory(inventoryData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar inventario');
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Inventario</h1>
        <Link href="/admin" className="text-blue-600 hover:underline">
          ← Volver al Panel
        </Link>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total productos</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm text-gray-500">Sin stock</p>
            <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm text-gray-500">Stock bajo</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm text-gray-500">En stock</p>
            <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.category?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.sku || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    ${item.price ? Number(item.price).toFixed(2) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockColor(item.stock)}`}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockColor(item.stock)}`}>
                      {getStockLabel(item.stock)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={adjustQuantity}
                          onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border rounded text-sm"
                        />
                        <select
                          value={adjustOperation}
                          onChange={(e) => setAdjustOperation(e.target.value as 'add' | 'set')}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="add">Agregar</option>
                          <option value="set">Establecer</option>
                        </select>
                        <button
                          onClick={() => handleAdjustStock(item.id)}
                          disabled={isAdjusting}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isAdjusting ? '...' : 'OK'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setAdjustQuantity(1);
                          setAdjustOperation('add');
                        }}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Ajustar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}