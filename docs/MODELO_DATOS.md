# Modelo de Datos - Manualidades Ana
Versión: 3.0 (Sin variantes)

---

## 1. Modelo Entidad-Relación Conceptual

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     USER     │       │   CATEGORY   │       │    PRODUCT   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ email        │       │ name         │       │ name         │
│ password     │       │ description  │       │ description  │
│ name         │       │ parentId     │       │ price        │
│ phone        │       │ isActive     │       │ sku          │
│ role         │       │ createdAt    │       │ stock        │
│ createdAt    │       │ updatedAt    │       │ categoryId   │
│ updatedAt    │       └──────┬───────┘       │ imageUrl1    │
└──────┬───────┘                │               │ imageUrl2    │
       │                        │               │ imageUrl3    │
       │                        │ 1:N           │ isActive     │
       │                        ▼               │ createdAt    │
       │                ┌──────────────┐       │ updatedAt    │
       │                │    ORDER     │       └──────┬───────┘
       │                ├──────────────┤              │
       │                │ id (PK)      │              │
       │                │ userId (FK)  │              │
       │                │ status       │              │
       │                │ totalAmount  │              │
       │                │ createdAt    │              │
       │                │ updatedAt    │              │
       │                └──────┬───────┘              │
       │                       │                      │
       │                       │ 1:N                  │
       │                       ▼                      │
       │                ┌──────────────┐              │
       │                │  ORDERITEM   │              │
       │                ├──────────────┤              │
       │                │ id (PK)      │              │
       └───────────────▶│ orderId (FK) │              │
                        │ productId(FK)│              │
                        │ quantity     │              │
                        │ priceAtPurchase              │
                        └──────────────┘
```

---

## 2. Tablas y Campos

### 2.1 Tabla: users

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | PK |
| email | VARCHAR(255) | NO | - | Email único |
| password | VARCHAR(255) | NO | - | Hash bcrypt |
| name | VARCHAR(100) | NO | - | Nombre completo |
| role | ENUM('ADMIN','CLIENT') | NO | 'CLIENT' | Rol del usuario |
| createdAt | DATETIME | NO | CURRENT_TIMESTAMP | Fecha creación |
| updatedAt | DATETIME | NO | CURRENT_TIMESTAMP ON UPDATE | Fecha modificación |

### 2.2 Tabla: categories

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | PK |
| name | VARCHAR(100) | NO | - | Nombre único |
| description | TEXT | YES | NULL | Descripción |
| parentId | INT | YES | NULL | FK autocreferencia |
| isActive | BOOLEAN | NO | TRUE | Soft delete |
| createdAt | DATETIME | NO | CURRENT_TIMESTAMP | Fecha creación |
| updatedAt | DATETIME | NO | CURRENT_TIMESTAMP ON UPDATE | Fecha modificación |

### 2.3 Tabla: products

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | PK |
| name | VARCHAR(200) | NO | - | Nombre del producto |
| description | TEXT | YES | NULL | Descripción |
| categoryId | INT | YES | NULL | FK a categories |
| price | DECIMAL(10,2) | NO | - | Precio del producto |
| sku | VARCHAR(50) | YES | NULL | Código único |
| stock | INT | NO | 0 | Cantidad disponible |
| imageUrl1 | VARCHAR(500) | YES | NULL | URL de imagen principal |
| imageUrl2 | VARCHAR(500) | YES | NULL | URL de imagen secundaria |
| imageUrl3 | VARCHAR(500) | YES | NULL | URL de imagen terciaria |
| marginPercentage | DECIMAL(5,2) | YES | NULL | Porcentaje de margen |
| isActive | BOOLEAN | NO | TRUE | Soft delete |
| createdAt | DATETIME | NO | CURRENT_TIMESTAMP | Fecha creación |
| updatedAt | DATETIME | NO | CURRENT_TIMESTAMP ON UPDATE | Fecha modificación |

**Nota**: El producto tiene sus propios campos de precio, stock y SKU.

### 2.4 Tabla: orders

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | PK |
| userId | INT | NO | - | FK a users |
| status | ENUM('PENDIENTE','ENVIADO','ENTREGADO','CANCELADO') | NO | 'PENDIENTE' | Estado |
| totalAmount | DECIMAL(10,2) | NO | - | Total del pedido |
| createdAt | DATETIME | NO | CURRENT_TIMESTAMP | Fecha creación |
| updatedAt | DATETIME | NO | CURRENT_TIMESTAMP ON UPDATE | Fecha modificación |

### 2.5 Tabla: order_items

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | PK |
| orderId | INT | NO | - | FK a orders |
| productId | INT | YES | NULL | FK a products |
| quantity | INT | NO | - | Cantidad |
| priceAtPurchase | DECIMAL(10,2) | YES | NULL | Snapshot precio |
| createdAt | DATETIME | NO | CURRENT_TIMESTAMP | Fecha creación |

**Nota**: productId es nullable por compatibilidad histórica.

### 2.6 Tabla: cart_items (para usuarios autenticados)

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | PK |
| userId | INT | NO | - | FK a users |
| productId | INT | NO | - | FK a products |
| quantity | INT | NO | 1 | Cantidad |
| createdAt | DATETIME | NO | CURRENT_TIMESTAMP | Fecha creación |
| updatedAt | DATETIME | NO | CURRENT_TIMESTAMP ON UPDATE | Fecha modificación |

---

## 3. Relaciones

| Relación | Tipo | Descripción |
|----------|------|-------------|
| User → Order | 1:N | Un usuario puede tener muchos pedidos |
| Category → Category | 1:N (autoreferencia) | Categorías pueden tener subcategorías |
| Category → Product | 1:N | Una categoría puede tener muchos productos |
| Order → OrderItem | 1:N | Un pedido tiene muchos items |
| Product → OrderItem | 1:N | Un producto puede aparecer en muchos items |
| User → CartItem | 1:N | Un usuario tiene un carrito |

---

## 4. Reglas de Negocio - Precio

**Regla**: El precio se define directamente en el producto.

---

## 5. Índices Recomendados

### 5.1 Índices Únicos

| Tabla | Campo(s) | Razón |
|-------|----------|-------|
| users | email | Evitar duplicados, login rápido |
| products | sku | SKUs deben ser únicos |

### 5.2 Índices de Rendimiento

| Tabla | Campo(s) | Razón |
|-------|----------|-------|
| products | categoryId, isActive | Filtrado por categoría y activos |
| products | isActive | Listar solo productos activos |
| products | stock | Alertas de stock bajo |
| orders | userId | Historial de pedidos del usuario |
| orders | status | Filtrar por estado (admin) |
| order_items | orderId | Obtener items de un pedido |
| cart_items | userId | Obtener carrito del usuario |
| cart_items | userId, productId | Evitar duplicados en carrito |

---

## 6. Consideraciones de Rendimiento

### 6.1 Desnormalización

- **priceAtPurchase**: Se almacena snapshot del precio al momento de compra para mantener historial exacto independientemente de cambios futuros.

### 6.2 Soft Deletes

- **isActive**: Todas las entidades principales tienen este campo para mantener integridad referencial con pedidos históricos.
- No se elimina físicamente ningún registro con pedidos asociados.

### 6.3 Transacciones

- **Creación de pedido**: Debe ejecutarse en transacción atómica:
  1. Validar stock disponible
  2. Crear registro en orders
  3. Crear registros en order_items
  4. Decrementar stock en productos
  5. Rollback si cualquier paso falla

### 6.4 Consultas Frecuentes

| Consulta | Optimización |
|----------|--------------|
| Listar productos por categoría | Índice compuesto (categoryId, isActive) |
| Buscar producto por nombre | Considerar FULLTEXT si crece |
| Carrito de usuario | Índice en userId |
| Pedidos por usuario | Índice en userId |
| Stock bajo | Índice en stock con condición |

### 6.5 Límites de Datos

| Campo | Límite | Razón |
|-------|--------|-------|
| email | 255 | RFC 5321 |
| name (producto) | 200 | UX |
| sku | 50 | Código interno |
| price | DECIMAL(10,2) | Máximo 99,999,999.99 |
| stock | INT | Máximo 2,147,483,647 |

### 6.6 Foreign Keys

| Relación | ON DELETE | ON UPDATE |
|----------|-----------|-----------|
| category.parentId | SET NULL | CASCADE |
| product.categoryId | SET NULL | CASCADE |
| order.userId | RESTRICT | CASCADE |
| order_item.orderId | CASCADE | CASCADE |
| order_item.productId | RESTRICT | CASCADE |
| cart_item.userId | CASCADE | CASCADE |
| cart_item.productId | CASCADE | CASCADE |

---

## 7. Diagrama de Dependencias de Eliminación

```
┌─────────┐     ┌──────────┐     ┌──────────┐
│  USER   │────▶│  ORDER   │────▶│ORDER_ITEM│
│ (RESTRICT)      └──────────┘     └────┬─────┘
└─────────┘                             │
                                      ▼
                               ┌──────────────┐
                               │   PRODUCT    │
                               └──────────────┘

CASCADE: Elimina hijos automáticamente
RESTRICT: Impide eliminar si hay dependientes
SET NULL: Pone en NULL el FK
```

**Nota**: No se puede eliminar un usuario si tiene pedidos asociados (RESTRICT).

---

## 8. Notas de Implementación

1. **Prisma schema** usará `InnoDB` como motor MySQL para soporte de transacciones.
2. **Charset**: utf8mb4 para soporte completo de emojis y caracteres especiales.
3. **Collation**: utf8mb4_unicode_ci para ordenamiento correcto en español.
4. **Timestamps**: Todos los registros tienen createdAt/updatedAt.
5. **Precio**: El precio se define directamente en el producto.
