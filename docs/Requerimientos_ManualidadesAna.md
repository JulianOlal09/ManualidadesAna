# SRS - Manualidades Ana
Versión: 2.0 (Optimizada para desarrollo asistido por IA)

---

# 1. Contexto del Proyecto

## 1.1 Objetivo
Desarrollar una plataforma web e-commerce para el negocio "Manualidades Ana" que permita:

- Gestión de inventario
- Venta en línea
- Gestión de pedidos
- Administración interna

El sistema debe ser escalable, seguro y preparado para futuras integraciones de pago.

---

# 2. Alcance del Sistema

## 2.1 Incluye

El sistema incluye:

- Catálogo de productos con variantes
- Gestión de inventario
- Registro e inicio de sesión
- Carrito de compras
- Creación de pedidos
- Panel de cliente
- Panel de administrador

## 2.2 No Incluye (Por ahora)

El sistema NO incluye:

- Integración de pagos (fase futura)
- Cálculo de impuestos
- Cálculo de costos de envío
- Integración con paqueterías
- Sistema multi-vendedor

El agente NO debe implementar funcionalidades fuera de este alcance.

---

# 3. Definiciones del Dominio

Producto:
Entidad base que contiene nombre, descripción, precio base y categoría.

Variante:
Sub-entidad de producto que puede modificar:
- Precio
- Stock
- SKU
- Estado

Pedido:
Registro formal de compra generado por un cliente autenticado.

Snapshot de precio:
Copia del precio almacenada en el pedido al momento de la compra.
No debe cambiar aunque el producto cambie de precio posteriormente.

---

# 4. Requerimientos Funcionales

## RF-01 Gestión de Productos

El sistema MUST permitir:

- Crear producto
- Editar producto
- Desactivar producto
- Listar productos por categoría
- Subir imágenes

Cada producto puede tener múltiples variantes.

Cada variante MUST tener:
- Stock independiente
- SKU único
- Estado (activo/inactivo)

Si una variante no define precio propio:
Debe heredar el precio base del producto.

---

## RF-02 Inventario

El sistema MUST:

- Reducir stock al confirmar pedido
- Impedir compra si stock insuficiente
- Permitir entrada manual de stock
- Mostrar alerta visual de stock bajo

El inventario se gestiona a nivel variante cuando existan variantes.

---

## RF-03 Carrito

El sistema MUST:

- Permitir agregar productos o variantes
- Permitir modificar cantidades
- Permitir eliminar items

Persistencia del carrito:

- Usuario autenticado → base de datos
- Usuario no autenticado → almacenamiento local

Antes de crear pedido:
El sistema MUST validar stock disponible.

---

## RF-04 Autenticación

El sistema MUST:

- Permitir registro
- Permitir login
- Almacenar contraseñas usando hashing seguro (bcrypt o equivalente)
- Utilizar JWT para autenticación
- Implementar roles: ADMIN y CLIENT

El panel administrativo MUST estar protegido por autorización basada en rol.

---

## RF-05 Pedidos

Estados válidos del pedido:

- PENDIENTE
- ENVIADO
- ENTREGADO

El sistema MUST:

- Permitir al ADMIN cambiar estado
- Permitir al CLIENT consultar estado
- Guardar snapshot del precio al momento de la compra

Cambios futuros en precios NO deben afectar pedidos históricos.

---

# 5. Reglas de Integridad

El sistema MUST NOT:

- Eliminar físicamente productos con pedidos asociados
- Eliminar variantes asociadas a pedidos históricos

En su lugar:
Deben marcarse como inactivos.

---

# 6. Requerimientos No Funcionales

## 6.1 Diseño

- Enfoque Mobile-First
- Diseño minimalista
- Uso obligatorio de paleta pastel
- Diseño responsivo

## 6.2 Seguridad

- HTTPS obligatorio en producción
- Middleware de autorización para rutas protegidas

## 6.3 Rendimiento

- Optimización de imágenes
- Tiempos de respuesta rápidos en catálogo
- Backups mensuales automatizados

---

# 7. Stack Tecnológico Obligatorio

Frontend:
- Next.js (App Router)
- Tailwind CSS

Backend:
- Node.js
- Express

ORM:
- Prisma

Base de datos:
- MySQL

---

# 8. Restricciones para el Agente IA

El agente:

- MUST seguir este documento como única fuente de verdad.
- MUST NOT agregar funcionalidades no descritas.
- MUST trabajar por fases.
- MUST diseñar arquitectura antes de implementar código.
- MUST mantener separación clara entre frontend y backend.
- MUST usar buenas prácticas profesionales.

Si existe ambigüedad:
El agente debe pedir aclaración antes de asumir comportamiento.