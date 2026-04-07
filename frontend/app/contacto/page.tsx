'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ContactPage() {
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedido-personalizado/pedido`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Error al enviar el pedido');
      }

      setSuccess(true);
      setFormData({ message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el pedido');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Inicia Sesión</h1>
          <p className="text-gray-600 mb-6">
            Necesitas tener una cuenta para enviar pedidos personalizados.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">¡Pedido Enviado!</h1>
          <p className="text-gray-600 mb-6">
            Tu pedido personalizado ha sido enviado correctamente. Nos pondremos en contacto contigo pronto.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Enviar otro pedido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Pedidos Personalizados
        </h1>
        <p className="text-gray-600 mb-2">
          ¿Tienes una idea especial? Cuéntanos qué te gustaría y te cotizamos.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Nos comunicaremos contigo via WhatsApp.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            <strong>Nombre:</strong> {user?.name}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Email:</strong> {user?.email}
          </p>
          {user?.phone && (
            <p className="text-sm text-gray-600">
              <strong>Teléfono:</strong> {user.phone}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Describe tu pedido *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors resize-none"
              placeholder="Puedes indicar que productos MDF sin decorar, servilleta, vela (color y forma) te gustaria para tu pedido personalizado..."
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-md"
          >
            {isLoading ? 'Enviando...' : '📨 Enviar Pedido'}
          </button>
        </form>
      </div>
    </div>
  );
}
