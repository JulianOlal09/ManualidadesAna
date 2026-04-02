'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import supplyService, { CreateSupplyInput, UpdateSupplyInput } from '@/services/supply.service';
import { Supply } from '@/types';

type ModalMode = 'createSupply' | 'editSupply' | null;

export default function AdminSuppliesPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [supplyForm, setSupplyForm] = useState<CreateSupplyInput>({ name: '', cost: 0 });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
    if (!authLoading && isAuthenticated && !isAdmin) router.push('/products');
    if (isAdmin) fetchData();
  }, [isAuthenticated, isAdmin, authLoading, router]);

  const fetchData = async () => {
    try {
      const data = await supplyService.getAll();
      setSupplies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setIsLoading(false);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Insumos</h1>
        <Link href="/admin" className="text-blue-600 hover:underline">← Panel</Link>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md text-sm">{success}</div>}

      <button onClick={openCreateSupply} className="mb-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
        + Nuevo Insumo
      </button>

      <div className="grid gap-4">
        {supplies.map((supply) => (
          <div key={supply.id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{supply.name}</h3>
                <p className="text-sm text-gray-500">Costo: ${Number(supply.cost).toFixed(2)}</p>
                {supply.products && supply.products.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Usado en {supply.products.length} producto(s)
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditSupply(supply)} className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                <button onClick={() => handleDeleteSupply(supply.id)} className="text-red-600 hover:text-red-800 text-sm">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {supplies.length === 0 && !isLoading && (
        <p className="text-gray-500 text-center py-8">No hay insumos. Crea el primero.</p>
      )}

      {modalMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {modalMode === 'createSupply' && 'Nuevo Insumo'}
              {modalMode === 'editSupply' && 'Editar Insumo'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input 
                  type="text" 
                  value={supplyForm.name} 
                  onChange={(e) => setSupplyForm({ ...supplyForm, name: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-md" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Costo unitario *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={supplyForm.cost} 
                  onChange={(e) => setSupplyForm({ ...supplyForm, cost: parseFloat(e.target.value) || 0 })} 
                  className="w-full px-3 py-2 border rounded-md" 
                  required 
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveSupply} 
                  disabled={isSaving || !supplyForm.name || supplyForm.cost <= 0} 
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
                <button 
                  onClick={closeModal} 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
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