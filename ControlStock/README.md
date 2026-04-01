# ControlStock

ControlStock queda organizado como una solucion empresarial de tres capas:

- [backend](C:/Users/chema/OneDrive/Documentos/GitHub/PI/ControlStock/backend): API REST en Laravel.
- [frontend](C:/Users/chema/OneDrive/Documentos/GitHub/PI/ControlStock/frontend): aplicacion web para administradores y encargados.
- [mobile](C:/Users/chema/OneDrive/Documentos/GitHub/PI/ControlStock/mobile): base de app React Native para empleados.

## Arquitectura

La arquitectura objetivo esta documentada en [ARQUITECTURA_EMPRESARIAL.md](C:/Users/chema/OneDrive/Documentos/GitHub/PI/ControlStock/ARQUITECTURA_EMPRESARIAL.md).

Principios:

- El backend centraliza autenticacion, permisos y reglas de negocio.
- Web y movil consumen la misma API REST.
- MySQL es la fuente unica de verdad.
- La bitacora, notificaciones y validaciones viven en backend.

## Capas del sistema

### Backend

- Laravel como API REST.
- Controladores, modelos, migraciones y autenticacion.
- Conexion a MySQL.

### Web

- Cliente administrativo actual.
- Consume el backend via `fetch` y endpoints `/api/...`.

### Mobile

- Nueva base en React Native con Expo.
- Consume el mismo backend.
- Pensada para empleados y operacion movil.

## Instalacion base

### Backend

```bash
cd backend
composer install
php artisan key:generate
php artisan migrate --seed
```

### Web

```bash
cd frontend
npm install
```

### Mobile

```bash
cd mobile
npm install
npm run start
```

Configura la URL del backend en [mobile/.env.example](C:/Users/chema/OneDrive/Documentos/GitHub/PI/ControlStock/mobile/.env.example) y en los `.env` de cada entorno.

## Documentacion adicional

- [INSTRUCCIONES.md](C:/Users/chema/OneDrive/Documentos/GitHub/PI/ControlStock/INSTRUCCIONES.md)
- [ARQUITECTURA_EMPRESARIAL.md](C:/Users/chema/OneDrive/Documentos/GitHub/PI/ControlStock/ARQUITECTURA_EMPRESARIAL.md)
- [mobile/README.md](C:/Users/chema/OneDrive/Documentos/GitHub/PI/ControlStock/mobile/README.md)
