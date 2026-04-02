'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { categoryService } from '@/services/product.service';
import { Category } from '@/types';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Manualidades Ana
        </h1>
        <p className="text-sm sm:text-lg text-gray-600">
          Productos artesanales únicos para ti
        </p>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Categorías</h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-gray-500">Cargando categorías...</div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-500 mb-4">No hay categorías disponibles</p>
          <Link href="/products" className="text-blue-600 hover:underline">
            Ver todos los productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="bg-white rounded-xl shadow-sm border p-3 sm:p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 sm:w-16 mx-auto mb-2 sm:mb-3 bg-pink-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-8 sm:h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-800">{category.name}</h3>
              {category.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 hidden sm:block">{category.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 sm:mt-12 text-center">
        <Link
          href="/products"
          className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-5 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-md text-sm sm:text-base"
        >
          Ver Todos los Productos
        </Link>
      </div>
    </div>
  );
}
