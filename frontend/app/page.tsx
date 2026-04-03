'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { categoryService } from '@/services/product.service';
import { Category } from '@/types';
import FeaturedCarousel from '@/components/home/FeaturedCarousel';

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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
      <div className="relative mb-10 sm:mb-14 rounded-2xl overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/flores.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/20 to-white/40" />
        <div className="relative text-center py-12 sm:py-16 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 drop-shadow-sm">
            Manualidades Ana
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-pink-600 mb-4 drop-shadow-sm">
            Arte que transforma espacios
          </h2>
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            En Manualidades Ana, convertimos ideas en piezas únicas hechas a mano con dedicación y creatividad.
          </p>
        </div>
      </div>

      <FeaturedCarousel />

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

      <div className="mt-12 sm:mt-16">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">¿Quiénes Somos?</h2>
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 sm:p-8">
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
            Somos un negocio orgullosamente originario de Silao, Guanajuato, con más de 5 años creando productos artesanales que combinan creatividad, calidad y detalle en cada acabado.
          </p>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
            Lo que comenzó con la elaboración de trabajos para la cooperativa de una escuela, hoy se ha transformado en una propuesta artesanal más completa y profesional. A lo largo de los años hemos perfeccionado técnicas y ampliado nuestro catálogo para ofrecer productos con acabados únicos y personalizados.
          </p>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
            Trabajamos con técnicas como:
          </p>
          <div className="space-y-2 mb-4 text-sm sm:text-base text-gray-700">
            <div className="flex items-center gap-2">✨ Decoupage</div>
            <div className="flex items-center gap-2">🎨 Pintura decorativa</div>
            <div className="flex items-center gap-2">🖌 Pasta 3D</div>
            <div className="flex items-center gap-2">✨ Aplicación de hoja de oro</div>
            <div className="flex items-center gap-2">🕯 Velas artesanales</div>
            <div className="flex items-center gap-2">🏺 Bases de yeso cerámico</div>
          </div>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
            Cada pieza es elaborada con dedicación, cuidando cada detalle para ofrecer productos que realcen tus espacios, sean un regalo especial o complementen cualquier evento.
          </p>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium mb-4">
            En Manualidades Ana no solo vendemos manualidades, ofrecemos piezas hechas con pasión, creatividad y compromiso con la calidad.
          </p>
          <p className="text-sm sm:text-base text-pink-600 font-semibold">
            Descubre el detalle que hace la diferencia.
          </p>
        </div>
      </div>
    </div>
  );
}
