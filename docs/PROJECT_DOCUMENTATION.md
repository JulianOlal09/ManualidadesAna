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
- **Frontend**: Configurado mediante `NEXT_PUBLIC_API_URL` como variable de entorno en el proveedor de deploy.

### 6.2 Manejo de secretos
- Los archivos `.env` no se versionan en el repositorio.
- Las credenciales se gestionan exclusivamente como variables de entorno en Railway/Vercel.

---

## 7. Deployment en Producción

### 7.1 Infraestructura
- **Base de Datos**: MySQL en Railway
- **Backend**: Node.js/Express desplegado en Railway
- **Frontend**: Next.js desplegado en Vercel

### 7.2 Configuración de Railway (Backend)

#### Variables de Entorno
```bash
DATABASE_URL=mysql://user:password@host:port/railway
JWT_SECRET=your-secret-key
PORT=3001
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_ENDPOINT_URL=https://t3.storageapi.dev
AWS_DEFAULT_REGION=auto
AWS_S3_BUCKET_NAME=your-bucket
```

#### Proceso de Deploy
Railway está configurado con **Nixpacks** para manejar el build y deployment:

**Build Process:**
```bash
npm ci                    # Instala dependencias
prisma generate          # Genera Prisma Client (postinstall)
npm run build            # Build script (solo mensaje)
```

**Start Process:**
El archivo `scripts/start.sh` ejecuta:
1. Migraciones de Prisma: `node node_modules/prisma/build/index.js db push --skip-generate`
2. Inicio del servidor: `node --import tsx src/server.ts`

#### Archivos de Configuración

**nixpacks.toml:**
```toml
[phases.setup]
nixPkgs = ["nodejs"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "node node_modules/prisma/build/index.js db push --skip-generate && node --import tsx src/server.ts"
```

**scripts/start.sh:**
```bash
#!/bin/bash
set -e

echo "Running Prisma migrations..."
node node_modules/prisma/build/index.js db push --skip-generate

echo "Starting server..."
exec node --import tsx src/server.ts
```

#### Notas Importantes
- Las migraciones se ejecutan en **startup** (no en build) para tener acceso a la red privada de Railway
- Se usa el path directo de Node (`node node_modules/prisma/build/index.js`) en lugar de `npx` para evitar problemas de permisos
- El servidor NO ejecuta migraciones en el código (ya se manejan en el script de inicio)
- `prisma` debe estar en `dependencies` (no en `devDependencies`)

### 7.3 Configuración de Vercel (Frontend)

#### Variables de Entorno
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

El frontend se conecta automáticamente al backend de Railway a través de esta variable.

### 7.4 Conexión a la Base de Datos de Producción

Para conectarte y visualizar los datos de producción:

**Opción 1: Prisma Studio (Recomendada)**
```bash
# Configurar DATABASE_URL en variables de entorno locales (no commitear)
npx prisma studio
# Abre http://localhost:5555
```

**Opción 2: Cliente MySQL**
Usar MySQL Workbench u otro cliente con las credenciales de Railway:
- Host: (desde Railway)
- Port: (desde Railway)
- Username: (desde Railway)
- Password: (desde Railway)
- Database: `railway`

### 7.5 Troubleshooting Común

**Error: "Permission denied" al ejecutar Prisma**
- Solución: Usar path directo de Node en lugar de `npx`
- Verificar que `prisma` esté en `dependencies`

**Error: "Can't reach database server" durante build**
- Solución: Mover migraciones del build al start script
- La base de datos no está disponible durante la fase de build

**Error: Tablas no existen en la base de datos**
- Solución: Ejecutar manualmente `npm run migrate` o verificar que el start script ejecute las migraciones

---

## 8. Comandos de Desarrollo

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

## 9. Consideraciones de UI/UX
- **Navbar**: Diseño moderno con gradiente (rosa-púrpura-azul), logo de la marca (`Logo-Letras.png`) y posición sticky.
- **Acceso Público**: Todo el catálogo es navegable sin cuenta.
- **Restricción de Admin**: Los administradores no pueden usar el carrito ni realizar compras para evitar inconsistencias en el sistema.

---

## 10. Sistema de Imágenes con S3 (Railway Storage)

### 10.1 Configuración del Bucket
El proyecto utiliza Railway Storage (Tigris) para almacenar imágenes de productos.

**Bucket Name**: `portable-tote-zktyu-xjvyf`
**Endpoint**: `https://t3.storageapi.dev`

### 10.2 Variables de Entorno en Railway
Agregar estas variables en **Railway → ManualidadesAna (Backend) → Variables**:

| Variable | Valor |
|----------|-------|
| `AWS_S3_BUCKET_NAME` | Tu bucket de Railway Storage |
| `AWS_DEFAULT_REGION` | `auto` |
| `AWS_ENDPOINT_URL` | `https://t3.storageapi.dev` |
| `AWS_ACCESS_KEY_ID` | Tu access key de Railway Storage |
| `AWS_SECRET_ACCESS_KEY` | Tu secret key de Railway Storage |
| `AWS_PUBLIC_URL` | (Opcional) URL pública custom |

### 10.3 URL Pública de Imágenes
La URL pública se genera automáticamente:
```
https://tu-bucket.t3.storageapi.dev/products/uuid.jpg
```

### 10.4 Dependencias
```bash
npm install @aws-sdk/client-s3 uuid multer
npm install -D @types/uuid @types/multer
```

### 10.5 Archivos del Sistema de Storage
- **Backend**: `backend/src/services/storage.service.ts` - Funciones `uploadImage`, `deleteImage`, `getPublicBaseUrl`
- **Rutas**: `backend/src/routes/product.routes.ts` - Middleware `multer` para multipart/form-data

### 10.6 Uso desde el Frontend
- El formulario de productos ahora permite subir archivos de imagen
- Se envía mediante `FormData` al endpoint `/products`
- Preview de imagen en tiempo real

---

## 11. Mejoras del Panel de Administración

### 11.1 Dashboard KPIs
El dashboard `/admin` incluye 5 tarjetas de KPIs:
- **Pedidos Pendientes**: Cantidad de pedidos en estado PENDIENTE
- **Ventas Totales**: Suma de pedidos en estado ENTREGADO
- **Productos en Stock**: Productos con stock > 0
- **Insumos Registrados**: Total de insumos en la base de datos
- **Costo Insumos**: Costo total del inventario de insumos

### 11.2 Notificaciones WhatsApp
Al confirmar un pedido, se abre WhatsApp con los detalles del pedido:
- Usa `wa.me` para abrir la app en móvil o WhatsApp Web en desktop
- Variable de entorno: `NEXT_PUBLIC_WHATSAPP_NUMBER`

### 11.3 Mejoras de UI
- **Footer**: Visible en versión móvil, incluye links a redes sociales (Instagram, TikTok, Facebook)
- **Modales**: Fondo con blur (bg-gray-900/30) en lugar de negro sólido
- **Iconos**: Alineados correctamente en las tarjetas KPI
- **Links de navegación**: Eliminar hipervínculos "Volver al Panel"

---

## 12. Paginación y Búsqueda

### 12.1 Sistema de Paginación
Se implementó paginación en todas las páginas administrativas para mejorar el rendimiento y la experiencia de usuario:

#### Páginas con Paginación
- **Inventario** (`/admin/inventory`): 25 productos por página
- **Productos** (`/admin/products`): 25 productos por página
- **Pedidos** (`/admin/orders`): 25 pedidos por página
- **Insumos** (`/admin/supplies`): 25 insumos por página

#### Características
- Navegación con botones "Anterior" y "Siguiente"
- Números de página con vista inteligente (muestra página actual ±1 y primera/última)
- Scroll automático al inicio al cambiar de página
- Contador de elementos: "Mostrando X - Y de Z elementos"

### 12.2 Búsqueda con Debounce
Todas las páginas admin incluyen búsqueda en tiempo real:
- Delay de 400ms para evitar sobrecarga de peticiones
- Reset automático a página 1 al buscar
- Búsqueda case-insensitive en backend

#### Endpoints con Búsqueda
```typescript
// Products
GET /products?page=1&limit=25&search=texto&includeInactive=true

// Orders
GET /admin/orders?page=1&limit=25&search=texto

// Supplies
GET /admin/supplies?page=1&limit=25&search=texto
```

---

## 13. Mejoras de UI/UX (Actualización 2024)

### 13.1 Diseño General
- **Sin bordes negros**: Eliminados de tarjetas de productos, categorías, carrito y checkout
- **Sombras suaves**: `shadow-sm` en todas las tarjetas para un look más moderno
- **Botones con color**: Fondos de color en lugar de outline (ej. `bg-blue-600` en lugar de `border-blue-600`)
- **Modales con blur**: `backdrop-blur-sm` en todos los modales para mejor contraste

### 13.2 Carrito Flotante
Se agregó un botón flotante del carrito en la esquina inferior derecha:
- Visible en todas las páginas (excepto admin)
- Muestra contador de productos
- Animación de bounce al agregar productos
- Color rosa/púrpura acorde al branding
- Responsive: se oculta en pantallas pequeñas cuando el navbar está visible

**Ubicación**: `frontend/src/components/cart/FloatingCartButton.tsx`

### 13.3 Notificaciones Mejoradas
Sistema de notificaciones con estado read/unread:
- Icono de campana con badge de contador
- Dropdown con lista de notificaciones
- Botón "Marcar como leída" por notificación
- Botón "Marcar todas como leídas"
- Navegación directa al pedido desde la notificación

### 13.4 Dashboard de Administración
Gráfico de tendencia de ventas:
- Línea de ventas mensuales con los últimos 6 meses
- Línea de tendencia calculada con regresión lineal
- Colores: verde para ventas, rojo para tendencia
- Librería: Recharts

### 13.5 Página de Inicio
- **Hero sin sombra**: Título principal sin `text-shadow`
- **Carrusel mejorado**: Productos destacados con navegación
- **Categorías**: Tarjetas sin borde negro, solo sombra suave

### 13.6 Autenticación
- **Modal de login/registro**: Fondo con `backdrop-blur-sm`
- **Diseño limpio**: Sin bordes negros, solo sombras

---

## 14. Comandos de Desarrollo

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

### Verificar Build
```bash
cd backend && npx tsc --noEmit    # Sin errores TypeScript
cd frontend && npm run build      # Build exitoso
```

---

## 15. Pedidos Personalizados (Abril 2026)

### 15.1 Visión General
Sistema que permite a usuarios autenticados solicitar pedidos personalizados de productos hecho a mano.

### 15.2 Estructura de Datos

#### Modelo CustomOrder (Prisma)
```prisma
enum CustomOrderStatus {
  PENDING
  CONTACTED
  COMPLETED
  CANCELLED
}

model CustomOrder {
  id        Int      @id @default(autoincrement())
  userId    Int
  message   String   @db.Text
  status    CustomOrderStatus @default(PENDING)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id])
}
```

#### Campo teléfono en User
```prisma
model User {
  // ... otros campos
  phone     String?  @db.VarChar(20)
}
```

### 15.3 Rutas del Backend

| Método | Ruta | Descripción | Autenticación |
|--------|------|--------------|----------------|
| POST | `/api/pedido-personalizado/pedido` | Crear nuevo pedido personalizado | ✅ Usuario |
| GET | `/api/pedido-personalizado/mis-pedidos` | Ver mis pedidos | ✅ Usuario |
| GET | `/api/pedido-personalizado/admin/all` | Listar todos (admin) | ✅ Admin |
| PATCH | `/api/pedido-personalizado/admin/:id/status` | Actualizar estado | ✅ Admin |

### 15.4 Flujo de Usuario

1. **Creación**: Usuario autenticado -> Formulario en `/contacto`
2. **Datos mostrados**: Nombre, Email, Teléfono del usuario
3. **Almacenamiento**: Se guarda en BD con status PENDING
4. **Notificación**: Se envía email a `analaura_1975@hotmail.com` via Resend

### 15.5 Flujo de Admin

1. **Acceso**: Panel en `/admin/custom-orders`
2. **Funcionalidades**:
   - Ver todos los pedidos personalizados
   - Filtrar por estado (PENDING, CONTACTED, COMPLETED, CANCELLED)
   - Actualizar status del pedido
   - Ver información de contacto del cliente

### 15.6 Páginas del Frontend

| Página | Descripción |
|--------|-------------|
| `/contacto` | Formulario de pedido personalizado |
| `/custom-orders` | Lista de pedidos del usuario |

### 15.7 Notificaciones por Email

**Template de email enviado**:
- Asunto: `Nuevo pedido personalizado de {nombre_usuario}`
- Contenido: Nombre, Email, Teléfono, Mensaje del cliente
- Destino: `analaura_1975@hotmail.com`

### 15.8 Estados del Pedido

| Estado | Descripción |
|--------|-------------|
| PENDING | Pedido enviado, esperando contacto |
| CONTACTED | Admin ha contactado al cliente |
| COMPLETED | Pedido concretado/entregado |
| CANCELLED | Pedido cancelado |

---

## 16. Cambios de UI/UX (Abril 2026)

### 16.1 Optimización del Navbar

**Problema original**: Demasiados elementos en el menú de navegación (8-9 items).

**Solución implementada**:
- Reducción a 3-4 items primarios en escritorio
- Menú desplegable para account management
- Estructura consistente desktop y mobile

**Items del menú desplegable**:
- Mi Perfil
- Mis Pedidos
- Mis Pedidos Personalizados
- Panel Admin (si es admin)
- Cerrar Sesión

### 16.2 Página de Pedidos Personalizados

- Eliminación del botón "Nuevo Pedido" en la lista de pedidos
- Margenes estandarizados con otras páginas de usuario
- Diseño responsive

### 16.3 Formulario de Contacto

Actualizaciones en `/contacto`:
- Muestra Nombre, Email y Teléfono del usuario
- Placeholder detallado: "Puedes indicar que productos MDF sin decorar y servilleta te gustaria para tu pedido personalizado..."
- Mensaje: "Nos comunicaremos contigo via WhatsApp"

### 16.4 Página de Productos

- Actualización del banner informativo:
  - **Antes**: "Para un pedido personalizado debes elegir una caja sin decoración y una servilleta, o en su defecto especificar tu diseño via WhatsApp."
  - **Ahora**: "Para un pedido personalizado dirígete al apartado Pedidos Personalizados."

---

## 17. Notas Técnicas Adicionales

### 17.1 Issues con Turbopack en Windows

**Problema**: Next.js 16 con Turbopack tiene un bug en Windows que causa error Fatal al procesar archivos CSS:
```
reading file "D:\Proyectos\Manualidades Ana\frontend\nul"
Función incorrecta. (os error 1)
```

**Solución**: Forzar uso de Webpack en lugar de Turbopack:

```json
// package.json
"dev": "next dev --webpack"
```

### 17.2 Configuración de Desarrollo

```bash
# Backend (Puerto 3001)
cd backend
npm run dev

# Frontend (Puerto 3000, con Webpack)
cd frontend
npm run dev
```

---

## 18. Corrección de Bug en Edición de Imágenes (Abril 2026)

### 18.1 Problema
Al editar un producto existente con imágenes, si el usuario reemplazaba solo algunas imágenes (ej. solo imagen 2 y 3), la imagen 1 se eliminaba o reemplazaba incorrectamente.

### 18.2 Causa
El frontend enviaba las imágenes como un array comprimido (solo los archivos no nulos), y el backend asumía que `files[0]` correspondía a `imageUrl1`, lo cual no era correcto cuando se omitían índices.

### 18.3 Solución
- **Backend**: Cambio de `multer.array('images', 3)` a `multer.fields()` con campos `image1`, `image2`, `image3` separados.
- **Frontend**: Envío de imágenes con nombres de campo explícitos (`image1`, `image2`, `image3`) conservando la posición original.

### 18.4 Archivos Modificados
- `backend/src/routes/product.routes.ts`
- `backend/src/controllers/product.controller.ts`
- `frontend/src/services/admin.service.ts`
- `frontend/app/admin/products/page.tsx`

---

## 19. Mejoras en Galería de Producto (Abril 2026)

### 19.1 Nueva Presentación
Se rediseñó la galería de la página de detalle de producto:

#### Desktop
- Miniaturas: Columna vertical a la izquierda del recuadro de imagen
- Imagen principal: Recuadro fijo de 400px de ancho × 500px de alto
- Flechas de navegación: A los lados del recuadro de imagen (fuera del recuadro), con posición fija
- Fondo del recuadro: Blanco

#### Móvil
- Imagen principal: Recuadro fijo de 280px de ancho × 350px de alto
- Flechas: A los lados del recuadro (fijas, no se mueven)
- Miniaturas: Debajo de la imagen principal (sin flechas adicionales)

### 19.2 Características
- **Recuadro de imagen fijo**: Alto y ancho constantes independientemente del tamaño de la imagen
- **Imágenes centradas**: Usando `object-contain` para mostrar la imagen completa sin recortes
- **Flechas fijas**: Siempre a la misma altura, nunca se mueven
- **Esquinas redondeadas**: Todas las imágenes tienen `rounded-lg`

### 19.3 Archivos Modificados
- `frontend/app/products/[id]/page.tsx`

---

*Documento actualizado: Abril 2026*
*Versión del proyecto: 1.0.0*
