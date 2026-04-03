'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { productService } from '@/services/product.service';
import { Product } from '@/types';

export default function FeaturedCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await productService.getFeatured(10);
        setProducts(data.filter(p => p.isActive).slice(0, 8));
      } catch (err) {
        console.error('Error loading featured products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    if (products.length > 4) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
      }, 4000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [products.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
      }, 4000);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="bg-gray-100 rounded-lg py-12 text-center text-gray-500">
          Cargando productos destacados...
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Productos Destacados
        </h2>
      </div>

      <div className="relative overflow-hidden">
        <div className="w-full">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
          >
            {products.map((product) => (
              <div key={product.id} className="w-1/3 flex-shrink-0 px-2 sm:px-4">
                <Link
                  href={`/products/${product.id}`}
                  className="block hover:opacity-90 transition-opacity"
                >
                  <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-md">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl sm:text-5xl text-gray-300">📦</span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {products.length > 3 && (
          <>
            <button
              onClick={() => goToSlide((currentIndex - 1 + products.length) % products.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:translate-x-0 bg-white shadow-md rounded-full p-1.5 sm:p-2 hover:bg-gray-50 z-10"
              aria-label="Anterior"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => goToSlide((currentIndex + 1) % products.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-0 bg-white shadow-md rounded-full p-1.5 sm:p-2 hover:bg-gray-50 z-10"
              aria-label="Siguiente"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {products.length > 3 && (
        <div className="flex justify-center mt-4 gap-2">
          {products.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                idx === currentIndex 
                  ? 'bg-pink-500' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ver slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}