'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { adminProductService, adminCategoryService, ProductWithDetails, CreateProductInput, UpdateProductInput } from '@/services/admin.service';
import { Category } from '@/types';

type ModalMode = 'createProduct' | 'editProduct' | null;

export default function AdminProductsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [productForm, setProductForm] = useState<CreateProductInput>({ name: '', description: '', categoryId: undefined, imageUrl: '', price: undefined, sku: '', stock: 0 });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
    if (!authLoading && isAuthenticated && !isAdmin) router.push('/products');
    if (isAdmin) fetchData();
  }, [isAuthenticated, isAdmin, authLoading, router]);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        adminProductService.getAll(),
        adminCategoryService.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateProduct = () => {
    setProductForm({ name: '', description: '', categoryId: undefined, imageUrl: '', price: undefined, sku: '', stock: 0 });
    setModalMode('createProduct');
  };

  const openEditProduct = (product: ProductWithDetails) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      categoryId: product.categoryId || undefined,
      imageUrl: product.imageUrl || '',
      price: product.price ?? undefined,
      sku: product.sku || '',
      stock: product.stock,
    });
    setModalMode('editProduct');
  };

  const handleSaveProduct = async () => {
    setIsSaving(true);
    setError('');
    try {
      if (modalMode === 'createProduct') {
        await adminProductService.create(productForm);
        setSuccess('Producto creado correctamente');
      } else if (modalMode === 'editProduct' && selectedProduct) {
        const updateData: UpdateProductInput = {
          name: productForm.name,
          description: productForm.description,
          categoryId: productForm.categoryId,
          imageUrl: productForm.imageUrl,
          price: productForm.price,
          sku: productForm.sku || undefined,
          stock: productForm.stock,
        };
        await adminProductService.update(selectedProduct.id, updateData);
        setSuccess('Producto actualizado correctamente');
      }
      setModalMode(null);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    setError('');
    try {
      await adminProductService.delete(id);
      setSuccess('Producto eliminado correctamente');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleToggleActive = async (id: number) => {
    setError('');
    try {
      await adminProductService.toggleActive(id);
      setSuccess('Estado actualizado correctamente');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedProduct(null);
    setError('');
  };

  if (authLoading || isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-gray-500">Cargando...</div></div>;
  }

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Productos</h1>
        <div className="flex gap-2">
          <Link href="/admin" className="text-blue-600 hover:underline">← Panel</Link>
          <Link href="/admin/categories" className="text-blue-600 hover:underline">Categorías</Link>
          <Link href="/admin/inventory" className="text-blue-600 hover:underline">Inventario →</Link>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md text-sm">{success}</div>}

      <button onClick={openCreateProduct} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        + Nuevo Producto
      </button>

      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className={`bg-white rounded-lg shadow-sm border p-4 ${!product.isActive ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                  {!product.isActive && <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">Inactivo</span>}
                </div>
                {product.category && <p className="text-sm text-gray-500">{product.category.name}</p>}
                {product.description && <p className="text-sm text-gray-600 mt-1">{product.description}</p>}
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <button onClick={() => handleToggleActive(product.id)} className="text-yellow-600 hover:text-yellow-800 text-sm">
                  {product.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => openEditProduct(product)} className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800 text-sm">Eliminar</button>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Precio:</span>
                <span className="ml-1 font-medium">{product.price ? `$${Number(product.price).toFixed(2)}` : '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">SKU:</span>
                <span className="ml-1">{product.sku || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">Stock:</span>
                <span className={`ml-1 font-medium ${product.stock === 0 ? 'text-red-600' : product.stock <= 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {product.stock}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Imagen:</span>
                <span className="ml-1">{product.imageUrl ? '✓' : '-'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !isLoading && (
        <p className="text-gray-500 text-center py-8">No hay productos. Crea el primero.</p>
      )}

      {/* Modal: Crear / Editar Producto */}
      {(modalMode === 'createProduct' || modalMode === 'editProduct') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {modalMode === 'createProduct' && 'Nuevo Producto'}
              {modalMode === 'editProduct' && 'Editar Producto'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={productForm.description || ''} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-md" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select value={productForm.categoryId || ''} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full px-3 py-2 border rounded-md">
                  <option value="">Sin categoría</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
                <input type="text" value={productForm.imageUrl || ''} onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })} className="w-full px-3 py-2 border rounded-md" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input type="number" step="0.01" min="0" value={productForm.price ?? ''} onChange={(e) => setProductForm({ ...productForm, price: e.target.value ? parseFloat(e.target.value) : undefined })} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input type="number" min="0" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input type="text" value={productForm.sku || ''} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} className="w-full px-3 py-2 border rounded-md" placeholder="Código único" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveProduct} disabled={isSaving || !productForm.name} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
                <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}