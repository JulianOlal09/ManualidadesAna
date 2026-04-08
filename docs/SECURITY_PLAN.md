# Plan de Seguridad - Manualidades Ana

## Estado del Proyecto

**Proyecto desplegado y en producción.** Cualquier cambio de seguridad debe considerar:
- Frontend en Vercel: `https://manualidades-ana.vercel.app`
- Backend en Railway: `https://manualidades-ana-backend-production.up.railway.app`
- Base de datos: MySQL en Railway

---

## Auditoría de Seguridad Realizada

### ✅ Hallazgos Positivos

| Área | Estado | Notas |
|------|--------|-------|
| Autenticación JWT | ✅ Seguro | Tokens con expiry, verificación en cada request |
| Protección de rutas | ✅ Seguro | Middleware verifica token y rol en todas las rutas sensibles |
| Rutas de admin | ✅ Seguro | Solo usuarios con role=ADMIN pueden acceder |
| Contraseñas hasheadas | ✅ Seguro | Usando bcrypt con salt adecuado |
| Credenciales en frontend | ✅ Seguro | No hay keys/API secrets en código frontend |

### ⚠️ Hallazgos que Requieren Atención

| # | Hallazgo | Severidad | Ubicación | Acción Requerida |
|---|----------|-----------|------------|------------------|
| 1 | Credenciales en `.env` | **CRÍTICA** | `backend/.env` | Mover a Railway (ya desplegado) |
| 2 | JWT Secret débil | **ALTA** | `.env: JWT_SECRET` | Rotar inmediatamente |
| 3 | CORS permisivo | ~~**MEDIA**~~ | ~~`backend/src/app.ts`~~ | ✅ **IMPLEMENTADO** - Ahora permite solo dominios configurados |
| 4 | Rate limiting | **MEDIA** | Express app | Considerar agregar |
| 5 | Sin logs estructurados | ~~**BAJA**~~ | ~~Varios archivos~~ | ✅ **IMPLEMENTADO** - Winston integrado |

---

## Plan de Mitigación para Proyecto ya Desplegado

### Fase 1: Acciones Inmediatas (24-48 horas)

#### 1.1 Rotar Credenciales Comprometidas

**❌ NO RECOMENDADO**: Cambiar credenciales ahora romperá el sistema hasta actualizar el código.

**✅ RECOMENDADO**: En el próximo deploy:
1. Generar nuevas credenciales AWS (R2)
2. Generar nueva API key de Resend
3. Generar JWT Secret robusto: `openssl rand -base64 32`
4. Actualizar Railway con los nuevos valores

#### 1.2 Proteger .env en Git

```bash
# Verificar que .env esté en .gitignore
backend/.env
frontend/.env.local
```

**Acción**: Ejecutar en ambos directorios:
```bash
git rm --cached backend/.env
git rm --cached frontend/.env.local
```

---

### Fase 2: Refuerzos de Seguridad (1 semana)

#### 2.1 ✅ CORS Configurado (Implementado)

**Ubicación**: `backend/src/app.ts`

```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
```

**Variables en Railway**:
```
ALLOWED_ORIGINS=https://manualidades-ana.vercel.app,https://www.manualidadesana.com,https://manualidadesana.com,http://localhost:3000
```

#### 2.2 Agregar Rate Limiting (Opcional)

Instalar:
```bash
cd backend
npm install express-rate-limit
```

Implementar en `app.ts`:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite por IP
  message: { error: 'Demasiadas solicitudes, intenta más tarde' }
});

app.use('/api', limiter);
```

---

### Fase 3: Monitoreo y Logging (2 semanas)

#### 3.1 ✅ Logging Estructurado (Implementado)

**Instalado**: winston

**Archivo**: `backend/src/utils/logger.ts`

```typescript
import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'manualidades-ana-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(...)
      )
    })
  ]
});

export default logger;
```

**Archivos actualizados**:
- `server.ts` - Logs de inicio
- `app.ts` - Manejo de errores
- `routes/customOrder.routes.ts` - Errores de rutas
- `services/storage.service.ts` - Errores de storage

**Output**:
```
2026-04-08T00:39:04.925Z [info]: Iniciando servidor...
2026-04-08T00:39:05.333Z [info]: Database connected
2026-04-08T00:39:05.335Z [info]: Server running on port 3001
```

#### 3.2 Configurar Alertas de Seguridad

En Railway, configurar health checks:
- Endpoint: `/health`
- Frequency: Cada 5 minutos

---

## Checklist de Seguridad Post-Deploy

### Verificaciones Diarias
- [ ] Revisar logs de Railway por errores 500
- [ ] Monitorear uso de API keys en dashboard de providers
- [ ] Verificar que solo IPs del rango de Vercel accedan al backend

### Verificaciones Semanales
- [ ] Revisar usuarios nuevos sospechosos
- [ ] Verificar que no haya spikes inusuales en tráfico
- [ ] Revisar logs de autenticación por intentos fallidos

### Verificaciones Mensuales
- [ ] Rotar credenciales de servicios (AWS, Resend, DB)
- [ ] Actualizar dependencias del proyecto
- [ ] Revisar permisos de usuarios en la base de datos

---

## Comandos de Seguridad

```bash
# Verificar qué archivos están en git
git status

# Ver si .env está en gitignore
cat backend/.gitignore
cat frontend/.gitignore

# Ver tokens JWT activos (en DB)
# Consultar tabla de usuarios para ver último login
```

---

## Contactos de Emergencia

| Servicio | Contacto | Acción si Comprometido |
|----------|----------|-------------------------|
| Hosting Backend | Railway Support | Regenerar Railway API Key |
| Hosting Frontend | Vercel Support | Regenerar Vercel API Key |
| Base de Datos | Railway Support | Regenerar DB password |
| Email (Resend) | Resend Dashboard | Regenerar API Key |
| Storage (R2) | Cloudflare Dashboard | Regenerar Access Keys |

---

## Notas Adicionales

- **No hacer cambios drásticos**: El sistema ya está en producción con usuarios activos
- **Testing en staging**: Cualquier cambio de seguridad debe probarse primero
- **Backup antes de todo**: Asegurar tener backup de DB antes de modificar credenciales
- **Comunicación**: Informar a los usuarios si hay mantenimiento planificado

---

*Documento creado: Abril 2026*
*Última actualización: Abril 2026*
*Próxima revisión programada: Mayo 2026*
