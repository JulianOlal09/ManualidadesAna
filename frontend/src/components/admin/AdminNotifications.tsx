'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import orderService from '@/services/order.service';
import inventoryService from '@/services/inventory.service';

interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  link?: string;
}

const NOTIFICATIONS_KEY = 'admin_notifications_read';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const readNotifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    const unread = notifications.filter(n => !readNotifications.includes(n.id)).length;
    setUnreadCount(unread);
  }, [notifications]);

  const markAsRead = () => {
    const allIds = notifications.map(n => n.id);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(allIds));
    setUnreadCount(0);
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (unreadCount > 0) {
      markAsRead();
    }
  };

  const fetchNotifications = async () => {
    try {
      const [orderStats, inventoryStats] = await Promise.all([
        orderService.getStats(),
        inventoryService.getStats(),
      ]);

      const newNotifications: Notification[] = [];

      // Notificación de pedidos pendientes
      if (orderStats.pendientes > 0) {
        newNotifications.push({
          id: 'pending-orders',
          type: 'info',
          title: 'Pedidos pendientes',
          message: `Tienes ${orderStats.pendientes} ${orderStats.pendientes === 1 ? 'pedido pendiente' : 'pedidos pendientes'} por procesar`,
          link: '/admin/orders',
        });
      }

      // Notificación de productos sin stock
      if (inventoryStats.outOfStock > 0) {
        newNotifications.push({
          id: 'out-of-stock',
          type: 'error',
          title: 'Productos sin stock',
          message: `${inventoryStats.outOfStock} ${inventoryStats.outOfStock === 1 ? 'producto' : 'productos'} sin stock disponible`,
          link: '/admin/inventory',
        });
      }

      // Notificación de productos con bajo stock
      if (inventoryStats.lowStock > 0) {
        newNotifications.push({
          id: 'low-stock',
          type: 'warning',
          title: 'Stock bajo',
          message: `${inventoryStats.lowStock} ${inventoryStats.lowStock === 1 ? 'producto tiene' : 'productos tienen'} stock bajo`,
          link: '/admin/inventory',
        });
      }

      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      case 'info':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel de notificaciones */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Notificaciones</h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Cargando...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <li key={notification.id}>
                      {notification.link ? (
                        <Link
                          href={notification.link}
                          className="block p-4 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                              {getTypeIcon(notification.type)}
                            </span>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-gray-800">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <span className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                              {getTypeIcon(notification.type)}
                            </span>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-gray-800">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
