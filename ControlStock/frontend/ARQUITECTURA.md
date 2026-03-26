# ControlStock Papelería - Arquitectura del Sistema

## Descripción General

Sistema de gestión de inventario para papelería con arquitectura cliente-servidor, que incluye una **versión web** para administradores y encargados, y una **versión móvil** para empleados.

---

## Arquitectura Técnica

### Backend (Simulado)
- **FastAPI**: API REST (simulada en `/src/app/services/api.ts`)
- **MySQL**: Base de datos compartida entre web y móvil
- **Endpoints**: CRUD completo para productos, entradas, salidas, empleados, proveedores

### Frontend

#### **Versión Web (1440x1024)**
- **Framework**: React 18 + TypeScript
- **Routing**: React Router v7
- **Estilos**: Tailwind CSS v4
- **Charts**: Recharts
- **Iconos**: Lucide React

#### **Versión Móvil (390x844)**
- Mismo stack tecnológico
- UI optimizada para dispositivos móviles
- Navegación inferior (bottom nav)

---

## Roles del Sistema

### 1. Administrador (Web)
**Acceso completo al sistema**

- ✅ Dashboard con métricas globales
- ✅ Gestión de productos (CRUD completo)
- ✅ Registro de entradas y salidas
- ✅ Gestión de empleados y usuarios
- ✅ Acceso a reportes
- ✅ Configuración del sistema

**Credenciales de prueba:**
- Usuario: `admin`
- Contraseña: `admin`

### 2. Encargado de Sucursal (Web)
**Gestión operativa del inventario**

- ✅ Dashboard con métricas
- ✅ Visualización de productos
- ✅ Registro de entradas y salidas
- ✅ Acceso a reportes
- ❌ No puede gestionar empleados
- ❌ No puede gestionar usuarios

**Credenciales de prueba:**
- Usuario: `encargado`
- Contraseña: `encargado`

### 3. Empleado (Móvil)
**Operaciones básicas de inventario**

- ✅ Dashboard personal
- ✅ Registro de entradas
- ✅ Registro de salidas
- ✅ Consulta de productos (solo lectura)
- ✅ Perfil y cambio de contraseña
- ❌ Sin acceso a gestión administrativa

**Credenciales de prueba:**
- Usuario: `empleado`
- Contraseña: `123456`

---

## Características Implementadas

### 🔐 Autenticación
- Login con validación de credenciales
- Context API para gestión de sesión
- Redirección automática según rol
- Estados de carga durante autenticación

### 📊 Dashboard
- **Web**: Métricas completas con gráficas
- **Móvil**: Vista simplificada con acciones rápidas
- Datos en tiempo real desde API
- Indicadores de sincronización

### 📦 Gestión de Productos
- **Web**: Tabla completa con búsqueda y filtros
- **Móvil**: Lista optimizada con indicadores visuales
- CRUD completo (solo administrador)
- Alertas de stock bajo
- Validaciones de formularios

### ⬇️ Registro de Entradas
- **Web**: Formulario con historial
- **Móvil**: UI táctil optimizada
- Validación de datos
- Confirmaciones visuales
- Registro de empleado responsable

### ⬆️ Registro de Salidas
- **Web**: Formulario con historial
- **Móvil**: UI con validación de stock
- Verificación de disponibilidad
- Mensajes de error si stock insuficiente
- Actualización en tiempo real

### 👥 Gestión de Empleados
- CRUD completo (solo administrador)
- Asignación de roles
- Gestión de áreas
- Estados activo/inactivo

### 🏢 Gestión de Proveedores
- CRUD completo
- Información de contacto
- Búsqueda y filtros

### 🔔 Notificaciones
- Alertas de stock bajo
- Registro de actividades
- Marcado de leídas/no leídas
- Eliminación de notificaciones

### ⚙️ Configuración
- Perfil de usuario
- Cambio de contraseña
- Información del rol
- Cierre de sesión

---

## Estados de la Aplicación

### ⏳ Loading States
- Spinners animados
- Textos descriptivos
- Deshabilitación de controles
- Indicadores visuales

### ❌ Error States
- Mensajes de error claros
- Opciones de reintento
- Validaciones de formularios
- Alertas visuales

### ✅ Success States
- Confirmaciones visuales
- Toast notifications
- Animaciones de éxito
- Feedback inmediato

### 📭 Empty States
- Mensajes informativos
- Iconos descriptivos
- Acciones sugeridas
- Guías visuales

---

## Componentes Reutilizables

### Common Components
```
/src/app/components/common/
├── LoadingSpinner.tsx      # Indicador de carga
├── ErrorState.tsx          # Estado de error
├── EmptyState.tsx          # Estado vacío
├── ConnectionIndicator.tsx # Estado de conexión
└── Toast.tsx               # Notificaciones emergentes
```

### Hooks Personalizados
```
/src/app/hooks/
├── useApi.ts    # Manejo de llamadas API
├── useFetch.ts  # Fetch de datos
└── useToast.ts  # Sistema de notificaciones
```

---

## Flujo de Datos

### 1. Autenticación
```
Login → API (/auth/login) → Context (guardar usuario + token) → Redirect según rol
```

### 2. Consulta de Datos
```
Componente → useFetch Hook → API Service → Loading State → Data/Error State
```

### 3. Modificación de Datos
```
Formulario → Validación → API Call → Loading → Success/Error → Update UI → Toast
```

### 4. Sincronización
```
API Call → Response → Update Local State → Visual Feedback → Sync Indicator
```

---

## Simulación de API

### Delay de Red
- Simulación de latencia realista (800-1200ms)
- Probabilidad de fallo (10%)
- Respuestas tipadas con TypeScript

### Endpoints Simulados

#### Auth
- `POST /auth/login` - Autenticación
- `POST /auth/change-password` - Cambio de contraseña

#### Productos
- `GET /productos` - Listar productos
- `POST /productos` - Crear producto
- `PUT /productos/:id` - Actualizar producto
- `DELETE /productos/:id` - Eliminar producto

#### Entradas
- `GET /entradas` - Listar entradas
- `POST /entradas` - Crear entrada

#### Salidas
- `GET /salidas` - Listar salidas
- `POST /salidas` - Crear salida (con validación de stock)

#### Dashboard
- `GET /dashboard/stats` - Estadísticas generales

#### Empleados
- `GET /empleados` - Listar empleados
- `POST /empleados` - Crear empleado
- `PUT /empleados/:id` - Actualizar empleado
- `DELETE /empleados/:id` - Eliminar empleado

#### Notificaciones
- `GET /notificaciones` - Listar notificaciones
- `PUT /notificaciones/:id/read` - Marcar como leída

---

## Validaciones Implementadas

### Formularios
- Campos requeridos
- Tipos de datos correctos
- Rangos válidos (stock mínimo, cantidades)
- Mensajes de error descriptivos

### Lógica de Negocio
- Validación de stock antes de salidas
- Verificación de permisos por rol
- Prevención de duplicados
- Confirmaciones para acciones críticas

---

## Optimizaciones

### Performance
- Lazy loading de componentes
- Debounce en búsquedas
- Actualización optimista de UI
- Caché local de datos

### UX
- Feedback inmediato
- Animaciones suaves
- Indicadores de progreso
- Navegación intuitiva

---

## Estructura de Archivos

```
src/app/
├── components/
│   ├── common/           # Componentes reutilizables
│   ├── mobile/           # Versión móvil
│   ├── Dashboard.tsx     # Dashboard web
│   ├── Productos.tsx     # Gestión productos
│   ├── Entradas.tsx      # Registro entradas
│   ├── Salidas.tsx       # Registro salidas
│   ├── Empleados.tsx     # Gestión empleados
│   ├── Notificaciones.tsx
│   ├── Configuracion.tsx
│   ├── Login.tsx
│   ├── Header.tsx
│   └── Sidebar.tsx
├── context/
│   └── AuthContext.tsx   # Context de autenticación
├── hooks/
│   ├── useApi.ts
│   ├── useFetch.ts
│   └── useToast.ts
├── services/
│   └── api.ts            # Servicios API simulados
└── App.tsx               # Configuración de rutas
```

---

## Próximos Pasos (Producción)

### Backend Real
1. Implementar FastAPI con Python
2. Configurar MySQL
3. Crear modelos y migraciones
4. Implementar JWT para autenticación
5. Configurar CORS

### Deployment
1. Configurar variables de entorno
2. Implementar HTTPS
3. Configurar CDN
4. Monitoring y logs
5. Backup de base de datos

### Funcionalidades Adicionales
- Reportes en PDF/Excel
- Gráficas avanzadas
- Sistema de auditoría
- Notificaciones push
- Chat interno
- Integración con código de barras

---

## Tecnologías Utilizadas

- React 18.3.1
- TypeScript
- React Router 7.13.0
- Tailwind CSS 4.1.12
- Recharts 2.15.2
- Lucide React 0.487.0
- Vite 6.3.5

---

## Autor

Sistema desarrollado con arquitectura moderna y mejores prácticas de desarrollo.

**Versión**: 2.0
**Fecha**: Febrero 2026