'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { adminCategoryService, CategoryWithChildren } from '@/services/admin.service';

type ModalMode = 'createCategory' | 'editCategory' | null;

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithChildren | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
    if (!authLoading && isAuthenticated && !isAdmin) router.push('/products');
    if (isAdmin) fetchCategories();
  }, [isAuthenticated, isAdmin, authLoading, router]);

  const fetchCategories = async () => {
    try {
      const data = await adminCategoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateCategory = () => {
    setCategoryForm({ name: '', description: '' });
    setModalMode('createCategory');
  };

  const openEditCategory = (category: CategoryWithChildren) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
    });
    setModalMode('editCategory');
  };

  const handleSaveCategory = async () => {
    setIsSaving(true);
    setError('');
    try {
      if (modalMode === 'createCategory') {
        await adminCategoryService.create(categoryForm);
        setSuccess('Categoría creada correctamente');
      } else if (modalMode === 'editCategory' && selectedCategory) {
        await adminCategoryService.update(selectedCategory.id, categoryForm);
        setSuccess('Categoría actualizada correctamente');
      }
      setModalMode(null);
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    setError('');
    try {
      await adminCategoryService.delete(id);
      setSuccess('Categoría eliminada correctamente');
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleToggleActive = async (id: number) => {
    setError('');
    try {
      await adminCategoryService.toggleActive(id);
      setSuccess('Estado actualizado correctamente');
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedCategory(null);
    setError('');
  };

  if (authLoading || isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-gray-500">Cargando...</div></div>;
  }

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Gestión de Categorías</h1>
      </div>

      {error && <div className="mb-3 md:mb-4 p-3 bg-red-50 text-red-600 rounded-md text-xs md:text-sm">{error}</div>}
      {success && <div className="mb-3 md:mb-4 p-3 bg-green-50 text-green-600 rounded-md text-xs md:text-sm">{success}</div>}

      <button onClick={openCreateCategory} className="mb-3 md:mb-4 px-3 md:px-4 py-2 bg-pink-600 text-white text-sm md:text-base rounded-lg hover:bg-pink-700">
        + Nueva Categoría
      </button>

      <div className="grid gap-3 md:gap-4">
        {categories.map((category) => (
          <div key={category.id} className={`bg-white rounded-lg shadow-sm p-3 md:p-4 ${!category.isActive ? 'opacity-60' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 break-words">{category.name}</h3>
                  {!category.isActive && <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded whitespace-nowrap">Inactiva</span>}
                  {category.parentId && <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-600 rounded whitespace-nowrap">Subcategoría</span>}
                </div>
                {category.description && <p className="text-xs md:text-sm text-gray-500 mt-1 break-words">{category.description}</p>}
                {category.parent && (
                  <p className="text-xs md:text-sm text-gray-400 mt-1">Pertenece a: {category.parent.name}</p>
                )}
              </div>
              <div className="flex gap-1.5 md:gap-2 flex-wrap sm:justify-end">
                <button onClick={() => handleToggleActive(category.id)} className="px-2 py-1 text-xs md:text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors whitespace-nowrap">
                  {category.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => openEditCategory(category)} className="px-2 py-1 text-xs md:text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors whitespace-nowrap">Editar</button>
                <button onClick={() => handleDeleteCategory(category.id)} className="px-2 py-1 text-xs md:text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors whitespace-nowrap">Eliminar</button>
              </div>
            </div>

            {category.children && category.children.length > 0 && (
              <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-100">
                <p className="text-xs md:text-sm text-gray-500 mb-2">Subcategorías:</p>
                <div className="flex flex-wrap gap-2">
                  {category.children.map((child) => (
                    <span key={child.id} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      {child.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && !isLoading && (
        <p className="text-gray-500 text-center py-8">No hay categorías. Crea la primera.</p>
      )}

      {/* Modal: Crear / Editar Categoría */}
      {(modalMode === 'createCategory' || modalMode === 'editCategory') && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
              {modalMode === 'createCategory' && 'Nueva Categoría'}
              {modalMode === 'editCategory' && 'Editar Categoría'}
            </h2>

            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={categoryForm.description || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveCategory}
                  disabled={isSaving || !categoryForm.name}
                  className="flex-1 px-3 md:px-4 py-2 bg-pink-600 text-white text-sm md:text-base rounded-lg hover:bg-pink-700 disabled:opacity-50 font-medium"
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
