# Arquitectura del Sistema - Manualidades Ana
Versión: 2.0 (Sin variantes)

---

## 1. Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENTE (Browser)                              │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │                    Frontend (Next.js)                          │     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │     │
│  │  │   Pages     │  │ Components  │  │  Context/State (Zustand│  │     │
│  │  │  (App Dir)  │  │   (UI)      │  │  o React Context)      │  │     │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │     │
│  └─────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/HTTPS + JWT
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SERVIDOR (Backend)                             │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │                    API (Express + Node.js)                     │     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │     │
│  │  │  Routes    │  │ Controllers │  │  Middleware │            │     │
│  │  │  (REST)    │  │  (Lógica)   │  │ (Auth/Valid)│            │     │
│  │  └─────────────┘  └─────────────┘  └─────────────┘            │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                    │                                      │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │                    Servicios (Capa de Negocio)                 │     │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────┐  │     │
│  │  │  Product  │ │   Order   │ │    Auth   │ │    Inventory  │  │     │
│  │  │  Service  │ │  Service  │ │  Service  │ │    Service    │  │     │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────────┘  │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                    │                                      │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │                    Capa de Datos (Prisma ORM)                  │     │
│  └─────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        BASE DE DATOS (MySQL)                             │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │  Users │ Products │ Categories │ Orders │ OrderItems│    │
│  └─────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Componentes Principales

| Capa | Tecnología | Responsabilidad |
|------|------------|-----------------|
| Frontend | Next.js 14 (App Router) | Renderizado, UI, gestión de estado |
| API Gateway | Express + Node.js | Endpoints REST, validación |
| Negocio | Services Layer | Lógica de dominio |
| Datos | Prisma ORM | Abstracción de BD |
| DB | MySQL 8.0 | Persistencia |

---

## 2. Flujo de Datos

### 2.1 Flujo de Autenticación

```
Usuario → Login Request → Express (Route) → AuthController
                                              ↓
                                        AuthService.validate()
                                              ↓
                                        JWT.generate()
                                              ↓
                                        Response + Cookie/Token
                                              ↓
                                        Usuario → Access Token
```

### 2.2 Flujo de Compra

```
1. Navegación
   Usuario → Catálogo → Next.js (Server Components)
                                    ↓
                           API: GET /products
                                    ↓
                           ProductService.list()
                                    ↓
                           Prisma → MySQL
                                    ↓
                           Response JSON

2. Carrito
   Usuario → Agregar al carrito → LocalStorage (invitado) / BD (auth)
                                    ↓
                           Validar stock → InventoryService
                                    ↓
                           Confirmar → POST /orders

3. Pedido
   POST /orders → OrderController.create()
                        ↓
                  OrderService.createOrder()
                        ↓
                  Transacción DB:
                    1. Crear pedido
                    2. Crear items con snapshot precio
                    3. Reducir stock productos
                        ↓
                  Response: Order ID
```

### 2.3 Flujo de Admin

```
Admin Dashboard → Protected Route (Middleware: checkRole[ADMIN])
                                        ↓
                              API: GET /admin/products
                                        ↓
                              ProductService.listAll()
                                        ↓
                              CRUD completo
```

---

## 3. Separación de Responsabilidades

### 3.1 Estructura de Carpetas

```
D:\Proyectos\Manualidades Ana\
├── frontend/                     # Next.js App
│   ├── src/
│   │   ├── app/                  # App Router (pages)
│   │   │   ├── (auth)/           # Grupo: autenticación
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (shop)/           # Grupo: tienda
│   │   │   │   ├── products/
│   │   │   │   ├── cart/
│   │   │   │   └── orders/
│   │   │   ├── admin/            # Panel admin
│   │   │   │   ├── products/
│   │   │   │   ├── orders/
│   │   │   │   └── dashboard/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/               # Componentes base
│   │   │   ├── product/          # Componentes producto
│   │   │   ├── cart/             # Componentes carrito
│   │   │   └── admin/            # Componentes admin
│   │   ├── contexts/             # React Context
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # Llamadas API
│   │   ├── types/                # TypeScript types
│   │   └── utils/                # Utilidades
│   └── package.json
│
├── backend/                      # Express API
│   ├── src/
│   │   ├── routes/               # Definiciones REST
│   │   ├── controllers/          # Manejo de requests
│   │   ├── services/             # Lógica de negocio
│   │   ├── middleware/           # Auth, validación
│   │   ├── repositories/         # Acceso a datos
│   │   ├── models/               # Esquemas Prisma
│   │   ├── utils/                # Helpers
│   │   └── index.ts              # Entry point
│   └── package.json
│
└── docs/
    ├── ARQUITECTURA.md
    └── Requerimientos_ManualidadesAna.md
```

### 3.2 Responsabilidades por Capa

| Capa | Responsable | No debe hacer |
|------|-------------|---------------|
| Routes | Direccionar URLs | Lógica de negocio |
| Controllers | Parsear request/response | Acceso directo a BD |
| Services | Lógica de dominio | HTTP handling |
| Repositories | Consultas SQL | Reglas de negocio |

---

## 4. Diagrama Lógico

### 4.1 Modelo de Datos (Entidades)

```
┌─────────────────┐       ┌─────────────────┐
│      User       │       │   Category      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ email (unique)  │       │ name            │
│ password_hash   │       │ description     │
│ name            │       │ parentId (FK)   │
│ phone           │       │ isActive        │
│ role (ENUM)     │       │ createdAt       │
│ createdAt       │       │ updatedAt       │
│ updatedAt       │       └────────┬────────┘
└────────┬────────┘                │
         │                         │
         │ 1:N                     │ 1:N
         ▼                         ▼
┌─────────────────────────────────────────────┐
│                  Product                    │
├─────────────────────────────────────────────┤
│ id (PK)                                     │
│ name                                        │
│ description                                 │
│ price                                       │
│ sku                                         │
│ stock                                       │
│ marginPercentage                            │
│ categoryId (FK)                            │
│ imageUrl1, imageUrl2, imageUrl3             │
│ isActive (boolean)                          │
│ createdAt                                   │
│ updatedAt                                   │
└─────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐
│     Order      │       │  OrderItem      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ userId (FK)     │◄──┐   │ orderId (FK)    │
│ status (ENUM)   │   └──│ productId (FK)  │
│ totalAmount     │       │ quantity        │
│ createdAt       │       │ priceAtPurchase │
│ updatedAt       │       │ (snapshot)      │
└─────────────────┘       └─────────────────┘
```

### 4.2 Relaciones entre Componentes

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌────────────┐    ┌────────────┐    ┌────────────────────────┐  │
│  │  Pages/    │───▶│ Components │───▶│  API Service Layer     │  │
│  │  App Router│    │    (UI)    │    │  (axios/fetch)         │  │
│  └────────────┘    └────────────┘    └───────────┬────────────┘  │
│                                                    │               │
└────────────────────────────────────────────────────┼───────────────┘
                                                     │ HTTP
┌────────────────────────────────────────────────────┼───────────────┐
│                         BACKEND                    ▼               │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    EXPRESS SERVER                              │ │
│  │  ┌──────────────┐    ┌──────────────┐    ┌────────────────┐  │ │
│  │  │   Routes     │───▶│ Controllers  │───▶│   Services     │  │ │
│  │  │ (auth,prod,  │    │ (parse/resp) │    │ (lógica dom.)  │  │ │
│  │  │  order,user) │    └──────────────┘    └───────┬────────┘  │ │
│  │  └──────────────┘                                │            │ │
│  │                                                  ▼            │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │                   PRISMA ORM                          │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                                                     │
                                                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                      DATABASE (MySQL)                            │
│  ┌────────┐  ┌──────────┐  ┌─────────┐  ┌───────┐  ┌─────────┐  │
│  │  User  │  │ Category │  │ Product │  │ Variant│  │  Order  │  │
│  └────────┘  └──────────┘  └─────────┘  └───────┘  └─────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Endpoints REST

### 5.1 Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registro de usuario | Público |
| POST | `/api/auth/login` | Inicio de sesión | Público |
| GET | `/api/auth/me` | Datos del usuario actual | JWT |
| POST | `/api/auth/logout` | Cerrar sesión | JWT |

### 5.2 Productos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | Listar productos (paginados, filtro por categoría) | Público |
| GET | `/api/products/:id` | Obtener producto | Público |
| POST | `/api/products` | Crear producto | ADMIN |
| PUT | `/api/products/:id` | Actualizar producto | ADMIN |
| DELETE | `/api/products/:id` | Desactivar producto | ADMIN |
| POST | `/api/products/:id/images` | Subir imagen | ADMIN |

### 5.3 Categorías

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/categories` | Listar categorías | Público |
| POST | `/api/categories` | Crear categoría | ADMIN |
| PUT | `/api/categories/:id` | Actualizar categoría | ADMIN |
| DELETE | `/api/categories/:id` | Desactivar categoría | ADMIN |

### 5.5 Carrito

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/cart` | Obtener carrito | JWT |
| POST | `/api/cart/items` | Agregar item | JWT |
| PUT | `/api/cart/items/:productId` | Actualizar cantidad | JWT |
| DELETE | `/api/cart/items/:productId` | Eliminar item | JWT |
| DELETE | `/api/cart` | Vaciar carrito | JWT |

### 5.6 Pedidos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Crear pedido desde carrito | JWT |
| GET | `/api/orders` | Listar pedidos del usuario | JWT |
| GET | `/api/orders/:id` | Ver detalle de pedido | JWT/ADMIN |
| PUT | `/api/orders/:id/status` | Actualizar estado | ADMIN |
| GET | `/api/admin/orders` | Listar todos los pedidos | ADMIN |

### 5.7 Inventario (Admin)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/inventory` | Ver stock de productos | ADMIN |
| POST | `/api/admin/inventory/:productId` | Entrada manual de stock | ADMIN |
| GET | `/api/admin/inventory/alerts` | Productos con stock bajo | ADMIN |

### 5.8 Resumen de Rutas Protegidas

```
PÚBLICO (sin auth):
  - GET /api/products
  - GET /api/products/:id
  - GET /api/categories
  - POST /api/auth/register
  - POST /api/auth/login

CLIENTE (JWT + rol CLIENT):
  - GET /api/auth/me
  - GET /api/cart
  - POST /api/cart/items
  - PUT /api/cart/items/:productId
  - DELETE /api/cart/items/:productId
  - DELETE /api/cart
  - POST /api/orders
  - GET /api/orders
  - GET /api/orders/:id

ADMIN (JWT + rol ADMIN):
  - Todas las anteriores +
  - CRUD /api/products
  - CRUD /api/categories
  - GET /api/admin/orders
  - PUT /api/orders/:id/status
  - GET /api/admin/inventory
  - POST /api/admin/inventory/:productId
  - GET /api/admin/inventory/alerts
  - POST /api/products/:id/images
```

---

## 6. Roles y Permisos

### 6.1 Definición de Roles

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| ADMIN | Administrador del sistema | Gestión completa de productos, categorías, pedidos e inventario |
| CLIENT | Cliente Comprador | Navegar catálogo, gestionar carrito, realizar pedidos, ver historial |

### 6.2 Matriz de Permisos

| Recurso | ADMIN | CLIENT |
|---------|-------|--------|
| Productos (lectura) | ✓ | ✓ |
| Productos (crear/editar/eliminar) | ✓ | ✗ |
| Categorías (lectura) | ✓ | ✓ |
| Categorías (crear/editar/eliminar) | ✓ | ✗ |
| Carrito (gestionar) | ✓ | ✓ (propio) |
| Pedidos (crear) | ✗ | ✓ (propio) |
| Pedidos (ver propios) | ✓ | ✓ |
| Pedidos (ver todos) | ✓ | ✗ |
| Pedidos (cambiar estado) | ✓ | ✗ |
| Inventario (ver) | ✓ | ✗ |
| Inventario (ajustar) | ✓ | ✗ |

---

## 7. Estrategia de Seguridad

### 7.1 Autenticación

- **Algoritmo**: JWT (JSON Web Tokens)
- **Almacenamiento**: 
  - Frontend: Cookie HTTP-only (secure en producción)
  - Alternativa: localStorage para móvil
- **Hashing**: bcrypt con salt de 10 rondas
- **Expiración token**: 7 días (access token)
- **Refresh token**: No implementado en fase 1

### 7.2 Protección de Rutas

```
Middleware: authenticateToken
  ↓
  ¿Token válido?
    ├─ NO → 401 Unauthorized
    └─ SI → ¿Ruta requiere rol específico?
              ├─ NO → Permitir
              └─ SI → ¿Usuario tiene rol?
                        ├─ NO → 403 Forbidden
                        └─ SI → Permitir
```

### 7.3 Validación de Entrada

- **Librería**: Zod (validación de esquemas)
- **Validación en**: Controllers y middleware
- **Sanitización**: Escape de datos antes de BD

### 7.4 Seguridad a Nivel HTTP

| Configuración | Descripción |
|---------------|-------------|
| HTTPS | Obligatorio en producción |
| CORS | Solo dominios autorizados |
| Helmet | Headers de seguridad |
| Rate Limiting | 100 req/15min por IP |
| CSRF | Tokens en formularios |

### 7.5 Seguridad a Nivel Datos

| Medida | Implementación |
|--------|----------------|
| SQL Injection | Prisma ORM (parametrizado) |
| XSS | Escape en frontend |
| Contraseñas | bcrypt hash |
| Roles | Verificación en cada endpoint protegido |
| Eliminación | Soft delete (isActive = false) |

### 7.6 Manejo de Errores

```typescript
// Estructura de respuesta de error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descripción legible",
    "details": [...] // opcional
  }
}

// Códigos de error
- 400: Bad Request (validación)
- 401: Unauthorized (no autenticado)
- 403: Forbidden (no autorizado)
- 404: Not Found
- 409: Conflict (ej: SKU duplicado)
- 422: Unprocessable Entity (reglas de negocio)
- 500: Internal Server Error
```

---

## 8. Consideraciones Adicionales

### 8.1 Excepciones Transaccionales

Crear pedido debe ejecutarse en transacción:
1. Validar stock de todos los productos
2. Crear registro de pedido
3. Crear items con snapshot de precio
4. Reducir stock de productos
5. Si falla → Rollback completo

### 8.2 Concurrencia

- Optimistic locking en inventario
- Transacciones serializables para pedidos críticos

### 8.3 Logs

- Winston logger para backend
- Niveles: error, warn, info, debug
- Rotación de archivos diaria
