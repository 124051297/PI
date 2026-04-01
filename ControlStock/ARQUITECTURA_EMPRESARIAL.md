# ControlStock - Arquitectura Empresarial

## Objetivo

ControlStock debe operar como una solucion de tres capas:

1. `backend/`
   API REST centralizada en Laravel.
2. `frontend/`
   Aplicacion web para administradores y encargados.
3. `mobile/`
   Aplicacion movil en React Native para empleados.

Ambas aplicaciones cliente consumen el mismo backend y comparten reglas de negocio, autenticacion y datos.

## Estructura del repositorio

```text
ControlStock/
|- backend/      # Laravel API REST + MySQL
|- frontend/     # Aplicacion web actual
|- mobile/       # Nueva app React Native / Expo
|- README.md
|- INSTRUCCIONES.md
|- ARQUITECTURA_EMPRESARIAL.md
```

## Responsabilidades por capa

### Backend Laravel API

Responsabilidades:

- Autenticacion con tokens.
- Autorizacion por roles.
- Validaciones.
- CRUD completo.
- Bitacora y notificaciones.
- Reportes.
- Persistencia en MySQL.

Regla principal:

- Ninguna regla de negocio critica debe vivir solo en web o movil.
- Todo proceso importante debe pasar por endpoints del backend.

## Aplicacion web

La web actual en `frontend/` se mantiene como cliente administrativo.

Responsabilidades:

- Dashboard.
- Reportes.
- Configuracion.
- Gestion de usuarios.
- Operacion avanzada de inventario.

## Aplicacion movil

La app movil en `mobile/` queda orientada a empleados.

Responsabilidades:

- Consulta de productos.
- Registro operativo de entradas y salidas.
- Consulta de notificaciones.
- Perfil del empleado.

## Roles

Roles soportados:

- `administrador`
- `encargado`
- `empleado`

## Consistencia y escalabilidad

- Web y movil consumen la misma API REST.
- MySQL es la fuente unica de verdad.
- La bitacora y las notificaciones deben generarse en backend.
- El backend centraliza permisos, validaciones y reglas de negocio.
