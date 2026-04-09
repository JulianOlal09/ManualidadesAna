'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminProductService, adminCategoryService, ProductWithDetails, CreateProductInput } from '@/services/admin.service';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [productForm, setProductForm] = useState<CreateProductInput>({ name: '', description: '', categoryId: undefined, price: undefined, sku: '', stock: 0 });
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null]);
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([null, null, null]);
  const [deleteImages, setDeleteImages] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
    if (!authLoading && isAuthenticated && !isAdmin) router.push('/products');
    if (isAdmin) fetchData();
  }, [isAuthenticated, isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [currentPage, isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsResult, categoriesData] = await Promise.all([
        adminProductService.getAll(currentPage, 25),
        adminCategoryService.getAll(),
      ]);
      setProducts(productsResult.data);
      setTotalPages(productsResult.totalPages);
      setTotal(productsResult.total);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
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

  const openCreateProduct = () => {
    setProductForm({ name: '', description: '', categoryId: undefined, price: undefined, sku: '', stock: 0 });
    setImageFiles([null, null, null]);
    setPreviewUrls([null, null, null]);
    setDeleteImages([false, false, false]);
    setModalMode('createProduct');
  };

  const openEditProduct = (product: ProductWithDetails) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      categoryId: product.categoryId || undefined,
      price: product.price ?? undefined,
      sku: product.sku || '',
      stock: product.stock,
    });
    setImageFiles([null, null, null]);
    setPreviewUrls([product.imageUrl1 || null, product.imageUrl2 || null, product.imageUrl3 || null]);
    setDeleteImages([false, false, false]);
    setModalMode('editProduct');
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFiles = [...imageFiles];
      const newPreviews = [...previewUrls];
      const newDeletes = [...deleteImages];
      const newFile = new File([file], file.name, { type: file.type });
      
      newFiles[index] = newFile;
      newPreviews[index] = URL.createObjectURL(newFile);
      newDeletes[index] = false;
      
      setImageFiles(newFiles);
      setPreviewUrls(newPreviews);
      setDeleteImages(newDeletes);
    }
  };

  const handleDeleteImageClick = (index: number) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...previewUrls];
    const newDeletes = [...deleteImages];
    
    newFiles[index] = null;
    newPreviews[index] = null;
    newDeletes[index] = true;
    
    setImageFiles(newFiles);
    setPreviewUrls(newPreviews);
    setDeleteImages(newDeletes);
  };

  const handleSaveProduct = async () => {
    setIsSaving(true);
    setError('');
    try {
      const filesToUpload = imageFiles;
      
      if (modalMode === 'createProduct') {
        await adminProductService.create(productForm, filesToUpload.length > 0 ? filesToUpload : undefined);
        setSuccess('Producto creado correctamente');
      } else if (modalMode === 'editProduct' && selectedProduct) {
        await adminProductService.update(
          selectedProduct.id, 
          { 
            ...productForm, 
            deleteImage1: deleteImages[0],
            deleteImage2: deleteImages[1],
            deleteImage3: deleteImages[2],
          }, 
          filesToUpload.length > 0 ? filesToUpload : undefined
        );
        setSuccess('Producto actualizado correctamente');
      }
      closeModal();
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedProduct(null);
    setImageFiles([null, null, null]);
    setPreviewUrls([null, null, null]);
    setDeleteImages([false, false, false]);
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

  if (authLoading || isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-gray-500">Cargando...</div></div>;
  }

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Gestión de Productos</h1>
      </div>

      {error && <div className="mb-3 md:mb-4 p-3 bg-red-50 text-red-600 rounded-md text-xs md:text-sm">{error}</div>}
      {success && <div className="mb-3 md:mb-4 p-3 bg-green-50 text-green-600 rounded-md text-xs md:text-sm">{success}</div>}

      <button onClick={openCreateProduct} className="mb-3 md:mb-4 px-3 md:px-4 py-2 bg-pink-600 text-white text-sm md:text-base rounded-lg hover:bg-pink-700">
        + Nuevo Producto
      </button>

      <div className="grid gap-3 md:gap-4">
        {products.map((product) => (
          <div key={product.id} className={`bg-white rounded-lg shadow-sm p-3 md:p-4 ${!product.isActive ? 'opacity-60' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 break-words">{product.name}</h3>
                  {!product.isActive && <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded whitespace-nowrap">Inactivo</span>}
                </div>
                {product.category && <p className="text-xs md:text-sm text-gray-500">{product.category.name}</p>}
                {product.description && <p className="text-xs md:text-sm text-gray-600 mt-1 break-words">{product.description}</p>}
              </div>
              <div className="flex gap-1.5 md:gap-2 flex-wrap sm:justify-end">
                <button onClick={() => handleToggleActive(product.id)} className="px-2 py-1 text-xs md:text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors whitespace-nowrap">
                  {product.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => openEditProduct(product)} className="px-2 py-1 text-xs md:text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors whitespace-nowrap">Editar</button>
                <button onClick={() => handleDeleteProduct(product.id)} className="px-2 py-1 text-xs md:text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors whitespace-nowrap">Eliminar</button>
              </div>
            </div>

            <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm">
              <div>
                <span className="text-gray-500">Precio:</span>
                <span className="ml-1 font-medium">{product.price ? `$${Number(product.price).toFixed(2)}` : '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">SKU:</span>
                <span className="ml-1 truncate">{product.sku || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500">Stock:</span>
                <span className={`ml-1 font-medium ${product.stock === 0 ? 'text-red-600' : product.stock <= 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {product.stock}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Imágenes:</span>
                <span className="ml-1">{[product.imageUrl1, product.imageUrl2, product.imageUrl3].filter(Boolean).length}/3</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !isLoading && (
        <p className="text-gray-500 text-center py-6 md:py-8 text-sm md:text-base">No hay productos. Crea el primero.</p>
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
          Mostrando {((currentPage - 1) * 25) + 1} - {Math.min(currentPage * 25, total)} de {total} productos
        </p>
      )}

      {/* Modal: Crear / Editar Producto */}
      {(modalMode === 'createProduct' || modalMode === 'editProduct') && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
              {modalMode === 'createProduct' && 'Nuevo Producto'}
              {modalMode === 'editProduct' && 'Editar Producto'}
            </h2>

            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" required />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={productForm.description || ''} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" rows={3} />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select value={productForm.categoryId || ''} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
                  <option value="">Sin categoría</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Imágenes (máx. 3)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((index) => (
                    <div key={index}>
                      {!previewUrls[index] ? (
                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-2 text-center hover:bg-gray-50 transition-colors cursor-pointer aspect-square flex items-center justify-center">
                          <div className="text-center">
                            <svg className="w-8 h-8 mx-auto text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <p className="text-xs text-gray-500">{index + 1}</p>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageChange(index, e)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      ) : (
                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-2 aspect-square">
                          <img src={previewUrls[index]!} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => handleDeleteImageClick(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            title="Eliminar imagen"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Sube hasta 3 imágenes del producto</p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input type="number" step="0.01" min="0" value={productForm.price ?? ''} onChange={(e) => setProductForm({ ...productForm, price: e.target.value ? parseFloat(e.target.value) : undefined })} className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input type="number" min="0" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input type="text" value={productForm.sku || ''} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" placeholder="Código único" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveProduct} disabled={isSaving || !productForm.name} className="flex-1 px-3 md:px-4 py-2 bg-pink-600 text-white text-sm md:text-base rounded-lg hover:bg-pink-700 disabled:opacity-50 font-medium">
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </button>
                <button onClick={closeModal} className="px-3 md:px-4 py-2 bg-gray-100 text-gray-700 text-sm md:text-base rounded-lg hover:bg-gray-200">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
