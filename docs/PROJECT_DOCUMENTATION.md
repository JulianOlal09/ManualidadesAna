# Manualidades Ana - Documentación Técnica Completa

## 1. Visión General del Proyecto

**Manualidades Ana** es una aplicación de comercio electrónico desarrollada para una tienda de manualidades. Permite la gestión de productos, inventario, pedidos, carrito de compras y un módulo de insumos básico.

### Stack Tecnológico
- **Frontend**: Next.js 15 (Turbopack), React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Base de Datos**: MySQL, Prisma ORM
- **Autenticación**: JWT (JSON Web Tokens)
- **Red**: Configurado para acceso en LAN (IP 192.168.1.30)

---

## 2. Arquitectura de la Base de Datos

### 2.1 Modelos de Prisma

#### Modelo User
- `id`: Int (PK)
- `email`: String (unique)
- `role`: Enum (ADMIN, CLIENT)
- **Relaciones**: orders[], cartItems[]

#### Modelo Product
- `id`: Int (PK)
- `name`: String
- `price`: Decimal(10,2)
- `stock`: Int
- `isActive`: Boolean
- **Relaciones**: category?, orderItems[], cartItems[]

#### Modelo Supply
- `id`: Int (PK)
- `name`: String (unique)
- `cost`: Decimal(10,2)
- **Nota**: El módulo se simplificó a CRUD básico por requerimiento del usuario.

#### Modelo Order
- `id`: Int (PK)
- `status`: Enum (PENDIENTE, ENVIADO, ENTREGADO, CANCELADO)
- `totalAmount`: Decimal(10,2)
- **Relaciones**: user?, items[]

---

## 3. Sistema de Carrito Dual (Invitado/Autenticado)

### 3.1 Carrito de Invitados
- Los usuarios no autenticados pueden navegar y agregar productos al carrito.
- Se utiliza `localStorage` mediante el servicio `localCartService`.
- El icono del carrito en el Navbar es visible para todos los usuarios.

### 3.2 Migración y Checkout
- Al hacer clic en "Confirmar Pedido", si el usuario no está autenticado, se le redirige al Login.
- Tras el inicio de sesión exitoso, el sistema migra automáticamente los items del `localStorage` al carrito del servidor en la base de datos.
- El proceso se completa en la página `/checkout`.

---

## 4. Flujo de Autenticación y Redirección Dinámica

### 4.1 Redirección Post-Login/Registro
Se implementó un sistema de redirección inteligente utilizando el parámetro `redirect` en la URL:
1. El Carrito envía `?redirect=/cart`.
2. Las páginas de `Login` y `Register` capturan este parámetro.
3. Tras el éxito:
   - Si es **ADMIN**: Redirige siempre a `/admin`.
   - Si es **CLIENTE**: Redirige al parámetro `redirect` (ej. de vuelta al carrito) o a `/products` por defecto.
4. Los enlaces entre Login y Registro preservan este parámetro para no perder el flujo.

---

## 5. Gestión de Pedidos e Inventario

### 5.1 Restauración de Stock
- **Creación de Pedido**: El stock disminuye automáticamente al confirmar la compra.
- **Cancelación**: Si un Administrador cambia el estado de un pedido a `CANCELADO`, el sistema utiliza una transacción de Prisma para restaurar automáticamente las cantidades de los productos al inventario.

### 5.2 Panel de Administración de Pedidos
- Ubicado en `/admin/orders`.
- Permite filtrar pedidos por estado.
- Permite actualizar el estado del pedido (Pendiente -> Enviado -> Entregado/Cancelado).

---

## 6. Configuración de Red y Seguridad

### 6.1 Acceso LAN
- **Backend**: Escucha en `http://192.168.1.30:3001`.
- **CORS**: Configurado para permitir cualquier origen (`*`) con credenciales, facilitando el acceso desde dispositivos móviles en la misma red.
- **Frontend**: Configurado mediante `NEXT_PUBLIC_API_URL` en `.env.local`.

---

## 7. Comandos de Desarrollo

### Backend
```bash
cd backend
npm run dev        # Puerto 3001
```

### Frontend
```bash
cd frontend
npm run dev        # Puerto 3000
```

---

## 8. Consideraciones de UI/UX
- **Navbar**: Diseño moderno con gradiente (rosa-púrpura-azul), logo de la marca (`Logo-Letras.png`) y posición sticky.
- **Acceso Público**: Todo el catálogo es navegable sin cuenta.
- **Restricción de Admin**: Los administradores no pueden usar el carrito ni realizar compras para evitar inconsistencias en el sistema.
