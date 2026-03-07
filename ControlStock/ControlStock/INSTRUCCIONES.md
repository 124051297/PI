# Instrucciones para ejecutar ControlStock Papelería

Este proyecto ha sido rediseñado para usar una arquitectura Cliente-Servidor con:
- **Backend:** Laravel (PHP) con una base de datos MySQL.
- **Frontend:** React JavaScript (Vite).

## Requisitos Previos
1. **XAMPP**: Debes tener XAMPP instalado que incluye PHP >= 8.2 y MySQL.
2. **Node.js**: Debes tener Node.js instalado (v18+).
3. **Composer**: Debes tener Composer instalado para manejar dependencias de PHP.

## 1. Configurar la Base de Datos (MySQL - XAMPP)
1. Abre el panel de control de XAMPP y enciende los módulos de **Apache** y **MySQL**.
2. Ingresa a `http://localhost/phpmyadmin` en tu navegador.
3. Asegúrate de que existe una base de datos llamada `controlstock`. Si no existe, créala.
4. Importa tus tablas existentes (`roles`, `areas`, `categorias`, `estado_producto`, `empleados`, `usuarios`, `productos`, `entradas`, `detalle_entradas`, `salidas`, `detalle_salidas`) en la base de datos `controlstock`.

## 2. Iniciar el Backend (Laravel)
Las credenciales de configuración de la base de datos ya se han configurado para usarse con XAMPP en `backend/.env` (usuario `root`, contraseña en blanco, db `controlstock`).

1. Abre una terminal y colócate en la carpeta `/backend`:
   ```bash
   cd c:/xampp/htdocs/ControlStock/backend
   ```
2. Instala las dependencias y genera la clave local (esto ya fue generado por el sistema automatizado, pero puedes confirmarlo):
   ```bash
   composer install
   php artisan key:generate
   ```
3. Levanta el servidor local de Artisan para la API en el puerto `8000`:
   ```bash
   php artisan serve
   ```
   > **Nota:** La API REST estará ahora escuchando peticiones en `http://localhost:8000/api`.

## 3. Iniciar el Frontend (React.js)
El frontend ya ha sido completamente migrado de TypeScript a JavaScript. Vite está encargado del entorno de desarrollo.

1. Abre una terminal nueva y dirígete a la carpeta `/frontend`:
   ```bash
   cd c:/xampp/htdocs/ControlStock/frontend
   ```
2. Instala las dependencias de Node:
   ```bash
   npm install
   ```
3. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   > **Nota:** La terminal te mostrará un link, como `http://localhost:5173`. Dale clic para ver tu interfaz Moderna Azul y Blanca del proyecto ERP. 

## Uso del Sistema
- El Frontend se comunica automáticamente con Laravel utilizando variables de entorno de `fetch()`.
- Puedes añadir nuevas áreas en la aplicación y esto hablará con el controlador REST de Areas.
- Asegúrate de tener al menos un Usuario en la base de datos tabla `usuarios` para probar el Login exitosamente.
