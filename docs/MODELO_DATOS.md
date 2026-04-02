# Modelo de Datos - Manualidades Ana
Versión: 2.0 (Ajustada)

---

## 1. Modelo Entidad-Relación Conceptual

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     USER     │       │   CATEGORY   │       │    PRODUCT   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ email        │       │ name         │       │ name         │
│ password     │       │ description  │       │ description  │
│ name         │       │ parentId     │       │ categoryId   │
│ role         │       │ isActive     │       │ imageUrl     │
│ createdAt    │       │ createdAt    │       │ isActive     │
│ updatedAt    │       │ updatedAt    │       │ createdAt    │
└──────┬───────┘       └──────┬───────┘       │ updatedAt    │
        │                     │                └──────┬───────┘
        │                     │                      │
        │                     │ 1:N                  1:N
        │                     ▼                      ▼
        │              ┌──────────────┐       ┌──────────────┐
        │              │    ORDER     │       │   VARIANT    │
        │              ├──────────────┤       ├──────────────┤
        │              │ id (PK)      │       │ id (PK)      │
        │              │ userId (FK)  │       │ productId    │
        │              │ status       │       │ name         │
        │              │ totalAmount  │       │ sku (UQ)     │
        │              │ createdAt    │       │ price (NN)   │
        │              │ updatedAt    │       │ stock        │
        │              └──────┬───────┘       │ isActive     │
        │                     │                │ createdAt    │
        │                     │ 1:N            │ updatedAt    │
        │                     ▼                └──────────────┘
        │              ┌──────────────┐
        │              │  ORDERITEM   │
        │              ├──────────────┤
        │              │ id (PK)      │
        └─────────────▶│ orderId (FK) │
                        │ variantId(FK)│
                        │ quantity     │
                        │ priceAtPurchase
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
| imageUrl | VARCHAR(500) | YES | NULL | URL de imagen |
| isActive | BOOLEAN | NO | TRUE | Soft delete |
| createdAt | DATETIME | NO | CURRENT_TIMESTAMP | Fecha creación |
| updatedAt | DATETIME | NO | CURRENT_TIMESTAMP ON UPDATE | Fecha modificación |

**Nota**: Product NO tiene precio. El precio se define exclusivamente en Variant.

### 2.4 Tabla: variants

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | PK |
| productId | INT | NO | - | FK a products |
| name | VARCHAR(200) | NO | - | Ej: "Rojo - Grande" |
| sku | VARCHAR(50) | YES | NULL | Código único |
| price | DECIMAL(10,2) | NO | - | Precio (OBLIGATORIO) |
| stock | INT | NO | 0 | Cantidad disponible |
| isActive | BOOLEAN | NO | TRUE | Soft delete |
| createdAt | DATETIME | NO | CURRENT_TIMESTAMP | Fecha creación |
| updatedAt | DATETIME | NO | CURRENT_TIMESTAMP ON UPDATE | Fecha modificación |

**Regla de precio**: Toda variante DEBE tener precio propio. No existe herencia.

### 2.5 Tabla: orders

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | PK |
| userId | INT | NO | - | FK a users |
| status | ENUM('PENDIENTE','ENVIADO','ENTREGADO','CANCELADO') | NO | 'PENDIENTE' | Estado |
| totalAmount | DECIMAL(10,2) | NO | - | Total del pedido |
| createdAt | DATETIME | NO | CURRENT_TIMESTAMP | Fecha creación |
| updatedAt | DATETIME | NO | CURRENT_TIMESTAMP ON UPDATE | Fecha modificación |

### 2.6 Tabla: order_items

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | PK |
| orderId | INT | NO | - | FK a orders |
| variantId | INT | NO | - | FK a variants (OBLIGATORIO) |
| quantity | INT | NO | - | Cantidad |
| priceAtPurchase | DECIMAL(10,2) | NO | - | Snapshot precio |
| createdAt | DATETIME | NO | CURRENT_TIMESTAMP | Fecha creación |

**Nota**: variantId es obligatorio. El productId se obtiene mediante variant.productId.

### 2.7 Tabla: cart_items (para usuarios autenticados)

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INT | NO | AUTO_INCREMENT | PK |
| userId | INT | NO | - | FK a users |
| variantId | INT | NO | - | FK a variants |
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
| Product → Variant | 1:N | Un producto puede tener muchas variantes |
| Order → OrderItem | 1:N | Un pedido tiene muchos items |
| Variant → OrderItem | 1:N | Una variante puede aparecer en muchos items |
| User → CartItem | 1:N | Un usuario tiene un carrito |

---

## 4. Reglas de Negocio - Precio

**Regla única y sin ambigüedad**:

- **Toda variante DEBE tener precio propio** (campo `price` es NOT NULL)
- Product NO tiene campo de precio
- El precio de una variante es independiente de cualquier otra variante o producto

Esta regla elimina cualquier posibilidad de ambigüedad sobre cuál precio usar.

---

## 5. Índices Recomendados

### 5.1 Índices Únicos

| Tabla | Campo(s) | Razón |
|-------|----------|-------|
| users | email | Evitar duplicados, login rápido |
| variants | sku | SKUs deben ser únicos |

### 5.2 Índices de Rendimiento

| Tabla | Campo(s) | Razón |
|-------|----------|-------|
| products | categoryId, isActive | Filtrado por categoría y activos |
| products | isActive | Listar solo productos activos |
| variants | productId | Obtener variantes de un producto |
| variants | stock | Alertas de stock bajo |
| orders | userId | Historial de pedidos del usuario |
| orders | status | Filtrar por estado (admin) |
| order_items | orderId | Obtener items de un pedido |
| cart_items | userId | Obtener carrito del usuario |
| cart_items | userId, variantId | Evitar duplicados en carrito |

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
  4. Decrementar stock en variants
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
| name (variante) | 200 | UX |
| sku | 50 | Código interno |
| price | DECIMAL(10,2) | Máximo 99,999,999.99 |
| stock | INT | Máximo 2,147,483,647 |

### 6.6 Foreign Keys

| Relación | ON DELETE | ON UPDATE |
|----------|-----------|-----------|
| category.parentId | SET NULL | CASCADE |
| product.categoryId | SET NULL | CASCADE |
| variant.productId | CASCADE | CASCADE |
| order.userId | RESTRICT | CASCADE |
| order_item.orderId | CASCADE | CASCADE |
| order_item.variantId | RESTRICT | CASCADE |
| cart_item.userId | CASCADE | CASCADE |
| cart_item.variantId | CASCADE | CASCADE |

---

## 7. Diagrama de Dependencias de Eliminación

```
┌─────────┐     ┌──────────┐     ┌──────────┐
│  USER   │────▶│  ORDER   │────▶│ORDER_ITEM│
│ (RESTRICT)      └──────────┘     └────┬─────┘
└─────────┘                             │
                                      ▼
                              ┌──────────────┐
                              │   VARIANT    │
                              └──────┬───────┘
                                     │
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
5. **Precio**: Toda variante DEBE tener precio propio (NOT NULL).
