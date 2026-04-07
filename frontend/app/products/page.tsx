'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Product, Category } from '@/types';
import productService, { categoryService, PaginatedProducts } from '@/services/product.service';

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get('category');
  
  const [productsData, setProductsData] = useState<PaginatedProducts | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const categoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : null;
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  }, [categoryIdParam]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsResult, categoriesData] = await Promise.all([
          productService.getAll(selectedCategory || undefined, currentPage, 25),
          categoryService.getAll(),
        ]);
        setProductsData(productsResult);
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar productos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (productsData?.totalPages || 1)) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentCategory = categories.find(c => c.id === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Cargando productos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  const products = productsData?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Pedidos y Pedidos Personalizados
        </h3>
        <p className="text-sm text-yellow-700">
          El pedido se gestiona via mensaje de WhatsApp. Para un pedido personalizado dirígete al apartado Pedidos Personalizados.
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {currentCategory ? currentCategory.name : 'Productos'}
        </h1>
        <Link href="/" className="text-blue-600 hover:underline">
          ← Volver
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        <button
          onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
            selectedCategory === null
              ? 'bg-pink-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => { setSelectedCategory(category.id); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-pink-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <p className="text-gray-500 mb-4">No hay productos en esta categoría</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Volver al inicio
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className={`block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${!product.isActive ? 'opacity-60' : ''}`}
              >
                <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden">
                  {(product.imageUrl1 || product.imageUrl2 || product.imageUrl3) ? (
                    <img
                      src={product.imageUrl1 || product.imageUrl2 || product.imageUrl3 || undefined}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <span className="text-2xl sm:text-4xl text-gray-300">📦</span>
                  )}
                </div>
                <div className="p-2 sm:p-4">
                  <h2 className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{product.name}</h2>
                  {product.category && (
                    <p className="text-xs text-gray-500 hidden sm:block">{product.category.name}</p>
                  )}
                  {product.price && (
                    <p className="text-sm sm:text-lg font-bold text-blue-600 mt-1">
                      ${Number(product.price).toFixed(2)}
                    </p>
                  )}
                  {product.stock === 0 && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">Sin stock</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {productsData && productsData.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Anterior
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: productsData.totalPages }, (_, i) => i + 1).map((page) => {
                  const showPage = 
                    page === 1 || 
                    page === productsData.totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1);
                  
                  if (!showPage) {
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg transition-colors ${
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
                disabled={currentPage === productsData.totalPages}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente →
              </button>
            </div>
          )}

          {productsData && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Mostrando {((currentPage - 1) * 25) + 1} - {Math.min(currentPage * 25, productsData.total)} de {productsData.total} productos
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-gray-500">Cargando productos...</div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductsContent />
    </Suspense>
  );
}