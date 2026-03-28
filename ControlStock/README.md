# 📦 ControlStock - Sistema de Gestión de Inventarios

Este repositorio contiene el sistema de control de stock de la papelería. Está dividido en dos partes principales:

-   **Backend:** Construido con Laravel (PHP) para servir la API.
-   **Frontend:** Construido con React.js (JavaScript) usando Vite.

## 🚀 Guía Rápida para el Equipo

Si acabas de clonar el proyecto y no te funciona, por favor lee las **instrucciones detalladas de instalación**:

👉 [VER INSTRUCCIONES DE INSTALACIÓN](./INSTRUCCIONES.md)

### Resumen de Requisitos:
*   **PHP 8.2+** (XAMPP recomendado)
*   **Composer** (Gestor de paquetes de PHP)
*   **Node.js v18+** (Para el frontend)
*   **MySQL Server** (XAMPP recomendado)

### Comandos que debes ejecutar:
1.  **Backend:**
    *   `cd backend`
    *   `composer install`
    *   `php artisan key:generate`
    *   `php artisan migrate:fresh --seed`
2.  **Frontend:**
    *   `cd ../frontend`
    *   `npm install`

Para más detalles sobre la configuración del archivo `.env` y la base de datos, consulta el archivo [INSTRUCCIONES.md](./INSTRUCCIONES.md).
