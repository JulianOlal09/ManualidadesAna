'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import supplyService, { CreateSupplyInput, PaginatedSupplies } from '@/services/supply.service';
import { Supply } from '@/types';

type ModalMode = 'createSupply' | 'editSupply' | null;

export default function AdminSuppliesPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  
  const [suppliesData, setSuppliesData] = useState<PaginatedSupplies | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [search, setSearch] = useState('');
  
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [supplyForm, setSupplyForm] = useState<CreateSupplyInput>({ name: '', cost: 0 });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
    if (!authLoading && isAuthenticated && !isAdmin) router.push('/products');
    if (isAdmin && !searchTimeout) fetchData();
  }, [isAuthenticated, isAdmin, authLoading, router]);

  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      if (isAdmin) {
        setCurrentPage(1);
        fetchData();
      }
    }, 400);
    setSearchTimeout(timeout);
  }, [search]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await supplyService.getAll(currentPage, 25, search);
      setSuppliesData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && searchTimeout) {
      fetchData();
    }
  }, [isAdmin, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (suppliesData?.totalPages || 1)) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openCreateSupply = () => {
    setSupplyForm({ name: '', cost: 0 });
    setModalMode('createSupply');
  };

  const openEditSupply = (supply: Supply) => {
    setSelectedSupply(supply);
    setSupplyForm({ name: supply.name, cost: supply.cost });
    setModalMode('editSupply');
  };

  const handleSaveSupply = async () => {
    setIsSaving(true);
    setError('');
    try {
      if (modalMode === 'createSupply') {
        await supplyService.create(supplyForm);
        setSuccess('Insumo creado correctamente');
      } else if (modalMode === 'editSupply' && selectedSupply) {
        await supplyService.update(selectedSupply.id, supplyForm);
        setSuccess('Insumo actualizado correctamente');
      }
      setModalMode(null);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSupply = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este insumo?')) return;
    setError('');
    try {
      await supplyService.delete(id);
      setSuccess('Insumo eliminado correctamente');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedSupply(null);
    setError('');
  };

  if (authLoading || isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-gray-500">Cargando...</div></div>;
  }

  if (!isAuthenticated || !isAdmin) return null;

  const supplies = suppliesData?.data || [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Gestión de Insumos</h1>
      </div>

      {error && <div className="mb-3 md:mb-4 p-3 bg-red-50 text-red-600 rounded-md text-xs md:text-sm">{error}</div>}
      {success && <div className="mb-3 md:mb-4 p-3 bg-green-50 text-green-600 rounded-md text-xs md:text-sm">{success}</div>}

      <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder="Buscar insumos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <button onClick={openCreateSupply} className="px-3 md:px-4 py-2 bg-amber-600 text-white text-sm md:text-base rounded-lg hover:bg-amber-700">
            + Nuevo Insumo
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:gap-4">
        {supplies.map((supply) => (
          <div key={supply.id} className="bg-white rounded-lg shadow-sm p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 break-words">{supply.name}</h3>
                <p className="text-xs md:text-sm text-gray-500">Costo: ${Number(supply.cost).toFixed(2)}</p>
                {supply.products && supply.products.length > 0 && (
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Usado en {supply.products.length} producto(s)
                  </p>
                )}
              </div>
              <div className="flex gap-1.5 md:gap-2 flex-wrap sm:justify-end">
                <button onClick={() => openEditSupply(supply)} className="px-2 py-1 text-xs md:text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors whitespace-nowrap">Editar</button>
                <button onClick={() => handleDeleteSupply(supply.id)} className="px-2 py-1 text-xs md:text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors whitespace-nowrap">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {supplies.length === 0 && !isLoading && (
        <p className="text-gray-500 text-center py-6 md:py-8 text-sm md:text-base">No hay insumos. Crea el primero.</p>
      )}

      {suppliesData && suppliesData.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 md:mt-6 px-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 md:px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm md:text-base hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: suppliesData.totalPages }, (_, i) => i + 1).map((page) => {
              const showPage = 
                page === 1 || 
                page === suppliesData.totalPages ||
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
                      ? 'bg-amber-600 text-white font-medium'
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
            disabled={currentPage === suppliesData.totalPages}
            className="px-3 md:px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm md:text-base hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}

      {suppliesData && (
        <p className="text-center text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
          Mostrando {((currentPage - 1) * 25) + 1} - {Math.min(currentPage * 25, suppliesData.total)} de {suppliesData.total} insumos
        </p>
      )}

      {modalMode && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
              {modalMode === 'createSupply' && 'Nuevo Insumo'}
              {modalMode === 'editSupply' && 'Editar Insumo'}
            </h2>

            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input 
                  type="text" 
                  value={supplyForm.name} 
                  onChange={(e) => setSupplyForm({ ...supplyForm, name: e.target.value })} 
                  className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Costo unitario *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={supplyForm.cost} 
                  onChange={(e) => setSupplyForm({ ...supplyForm, cost: parseFloat(e.target.value) || 0 })} 
                  className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" 
                  required 
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveSupply} 
                  disabled={isSaving || !supplyForm.name || supplyForm.cost <= 0} 
                  className="flex-1 px-3 md:px-4 py-2 bg-amber-600 text-white text-sm md:text-base rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium"
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
                <button 
                  onClick={closeModal} 
                  className="px-3 md:px-4 py-2 bg-gray-100 text-gray-700 text-sm md:text-base rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
