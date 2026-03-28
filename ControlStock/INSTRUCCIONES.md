# 🚀 Guía de Instalación para el Equipo - ControlStock

Esta guía detalla los pasos y herramientas necesarias para que cualquier integrante del equipo pueda correr el proyecto en su propia computadora después de clonarlo desde GitHub.

---

## 🛠️ 1. Software Necesario (Descargas)

Antes de empezar, todos deben tener instalado lo siguiente:

1.  **Node.js (v18 o superior):** Es necesario para el frontend.
    *   [Descargar Node.js](https://nodejs.org/) (Recomendado: Versión LTS).
2.  **PHP (v8.2 o superior):** El backend de Laravel funciona con PHP.
    *   *Sugerencia:* Instala **XAMPP** para tener PHP y MySQL al mismo tiempo. [Descargar XAMPP](https://www.apachefriends.org/es/index.html).
3.  **Composer:** Es el gestor de paquetes de PHP (como `npm` pero para Laravel).
    *   [Descargar Composer](https://getcomposer.org/download/).
4.  **MySQL Server:** La base de datos. Si instalaste XAMPP, ya lo tienes (solo activa el módulo MySQL en el panel de XAMPP).

---

## 💾 2. Configuración Inicial (Pasos después del Clone)

Una vez que clonas el repositorio, sigue estos pasos:

### A. Configurar el Backend (Carpeta `backend`)

Los archivos `.env` (donde está la contraseña de la base de datos) no se suben a GitHub por seguridad, así que cada integrante debe crearlo:

1.  Entra a la carpeta: `cd backend`
2.  Copia el archivo de ejemplo: `copy .env.example .env` (o cámbiale el nombre manualmente).
3.  **Configura la base de datos en el archivo `.env`:**
    Abre el archivo `.env` y busca estas líneas. Asegúrate de que coincidan con tu MySQL local:
    ```env
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=controlstock
    DB_USERNAME=root
    DB_PASSWORD=            # Pon aquí tu contraseña de MySQL (o déjalo vacío si no tienes)
    ```
4.  Instala las librerías: `composer install`
5.  Genera la llave secreta: `php artisan key:generate`
6.  **Crear las tablas y datos de prueba:**
    Asegúrate de tener prendido MySQL en XAMPP y que exista la base de datos `controlstock`. Luego corre:
    ```bash
    php artisan migrate:fresh --seed
    ```

### B. Configurar el Frontend (Carpeta `frontend`)

1.  Entra a la carpeta: `cd ../frontend`
2.  Instala las librerías: `npm install`

---

## 🏃‍♂️ 3. Ejecución del Proyecto

Para que el programa funcione, **debes tener dos terminales abiertas** corriendo ambos servidores al mismo tiempo:

*   **Terminal 1 (Backend):**
    ```bash
    cd backend
    php artisan serve
    ```
    *(Esto encenderá el API en http://localhost:8000)*

*   **Terminal 2 (Frontend):**
    ```bash
    cd frontend
    npm run dev
    ```
    *(Esto encenderá el sitio en http://localhost:5173)*

---

## ❓ ¿Por qué no les funciona a mis compañeros? (Soluciones comunes)

1.  **Falta el archivo `.env`:** Sin este archivo, Laravel no sabe cómo conectarse a la base de datos.
2.  **No corrieron `composer install` o `npm install`:** Las carpetas `vendor` y `node_modules` no están en GitHub; cada quien debe descargarlas con esos comandos.
3.  **No crearon la base de datos:** En MySQL (XAMPP/phpMyAdmin) deben crear una base de datos vacía llamada `controlstock` antes de correr las migraciones.
4.  **Versión de PHP:** Asegúrense de usar PHP 8.2 o superior. Pueden revisarlo escribiendo `php -v` en la terminal.
