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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Categorías</h1>
        <div className="flex gap-2">
          <Link href="/admin" className="text-blue-600 hover:underline">← Panel</Link>
          <Link href="/admin/products" className="text-blue-600 hover:underline">Productos →</Link>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md text-sm">{success}</div>}

      <button onClick={openCreateCategory} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        + Nueva Categoría
      </button>

      <div className="grid gap-4">
        {categories.map((category) => (
          <div key={category.id} className={`bg-white rounded-lg shadow-sm border p-4 ${!category.isActive ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                  {!category.isActive && <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">Inactiva</span>}
                  {category.parentId && <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-600 rounded">Subcategoría</span>}
                </div>
                {category.description && <p className="text-sm text-gray-500 mt-1">{category.description}</p>}
                {category.parent && (
                  <p className="text-sm text-gray-400 mt-1">Pertenece a: {category.parent.name}</p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <button onClick={() => handleToggleActive(category.id)} className="text-yellow-600 hover:text-yellow-800 text-sm">
                  {category.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => openEditCategory(category)} className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                <button onClick={() => handleDeleteCategory(category.id)} className="text-red-600 hover:text-red-800 text-sm">Eliminar</button>
              </div>
            </div>

            {category.children && category.children.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-gray-500 mb-2">Subcategorías:</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {modalMode === 'createCategory' && 'Nueva Categoría'}
              {modalMode === 'editCategory' && 'Editar Categoría'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={categoryForm.description || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveCategory}
                  disabled={isSaving || !categoryForm.name}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
