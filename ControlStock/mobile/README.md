# ControlStock Mobile

Aplicacion movil React Native para empleados, conectada al mismo backend Laravel del sistema.

## Stack propuesto

- React Native con Expo
- React Navigation
- Fetch API para consumir el backend

## Objetivo funcional

Pantallas base:

- Login
- Dashboard de empleado
- Productos
- Entradas
- Salidas
- Notificaciones
- Perfil

## Configuracion

1. Crear archivo `.env`
2. Definir la URL del backend:

```env
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:8000/api
```

## Comandos

```bash
npm install
npm run start
```

## Importante

- La app movil usa el mismo backend y la misma base MySQL.
- El control de acceso se resuelve en la API.
- No debe contener reglas de negocio duplicadas.
