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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Manualidades Ana
        </h1>
        <p className="text-lg text-gray-600">
          Productos artesanales únicos para ti
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Categorías</h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Cargando categorías...</div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No hay categorías disponibles</p>
          <Link href="/products" className="text-blue-600 hover:underline">
            Ver todos los productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="bg-white rounded-xl shadow-sm border p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 mx-auto mb-3 bg-pink-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800">{category.name}</h3>
              {category.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{category.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/products"
          className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-md"
        >
          Ver Todos los Productos
        </Link>
      </div>
    </div>
  );
}
