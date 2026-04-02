'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types';
import productService from '@/services/product.service';
import cartService from '@/services/cart.service';
import localCartService from '@/services/localCart.service';
import { useAuth } from '@/context/AuthContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const productId = parseInt(params.id as string, 10);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getById(productId);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar producto');
      } finally {
        setIsLoading(false);
      }
    };

    if (!isNaN(productId)) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    setError('');
    setSuccess('');

    try {
      if (isAuthenticated && !isAdmin) {
        // Usuario autenticado: usar carrito del servidor
        await cartService.addItem({
          productId: product.id,
          quantity,
        });
      } else {
        // Usuario invitado: usar carrito local
        localCartService.addItem({
          productId: product.id,
          quantity,
          name: product.name,
          price: Number(product.price),
          imageUrl: product.imageUrl || undefined,
          stock: product.stock,
        });
      }
      setSuccess('Producto agregado al carrito');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar al carrito');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 mb-4">Producto no encontrado</p>
        <button
          onClick={() => router.push('/products')}
          className="text-blue-600 hover:underline"
        >
          Volver a productos
        </button>
      </div>
    );
  }

  const displayPrice = product.price ? Number(product.price) : 0;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
      <button
        onClick={() => router.back()}
        className="text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base"
      >
        ← Volver
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
        <div className="aspect-square sm:aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-5xl sm:text-6xl text-gray-300">📦</span>
          )}
        </div>

        <div className="p-2 sm:p-0">
          {product.category && (
            <p className="text-xs sm:text-sm text-gray-500">{product.category.name}</p>
          )}
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
          {product.description && (
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{product.description}</p>
          )}

          <div className="space-y-3 sm:space-y-4">
            {product.sku && (
              <p className="text-xs sm:text-sm text-gray-500">SKU: {product.sku}</p>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Cantidad
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 sm:px-3 sm:py-1 border rounded"
                >
                  -
                </button>
                <span className="text-base sm:text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 sm:px-3 sm:py-1 border rounded"
                >
                  +
                </button>
              </div>
            </div>

            <div className="pt-2 sm:pt-4">
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                ${(displayPrice * quantity).toFixed(2)}
              </p>
              {isLowStock && (
                <p className="text-xs sm:text-sm text-orange-600">
                  ¡Solo quedan {product.stock} unidades!
                </p>
              )}
              {isOutOfStock && (
                <p className="text-xs sm:text-sm text-red-600">Sin stock disponible</p>
              )}
            </div>

            {error && <p className="text-red-600 text-xs sm:text-sm">{error}</p>}
            {success && <p className="text-green-600 text-xs sm:text-sm">{success}</p>}

            {!isAdmin && (
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 sm:py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-md text-sm sm:text-base"
              >
                {isAddingToCart
                  ? 'Agregando...'
                  : isOutOfStock
                  ? 'Sin stock'
                  : '🛒 Agregar al Carrito'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}