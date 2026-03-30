
--  USUARIOS DE ACCESO AL SISTEMA:
--  +-------------+-----------------+------------------------+
--  | Usuario     | Contraseña      | Rol                    |
--  +-------------+-----------------+------------------------+
--  | chema       | admin123        | Administrador (Web)    |
--  | victor      | encargado123    | Encargado (Web)        |
--  | sebas       | empleado123     | Empleado (Móvil)       |
--  +-------------+-----------------+------------------------+
-- Eliminar y recrear la base de datos
DROP DATABASE IF EXISTS controlstock;
CREATE DATABASE controlstock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE controlstock;


CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE areas (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE empleados (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    id_area INT NOT NULL,
    id_rol INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    ap VARCHAR(70) NOT NULL,
    am VARCHAR(70),
    telefono VARCHAR(20) UNIQUE,
    correo VARCHAR(150) UNIQUE,
    FOREIGN KEY (id_area) REFERENCES areas(id_area),
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    ultima_modificacion DATE,
    id_empleado INT NOT NULL,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado)
);

CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_producto VARCHAR(250) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    stock_minimo INT NOT NULL,
    id_categoria INT NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
);

CREATE TABLE ubicaciones (
    id_ubicacion INT AUTO_INCREMENT PRIMARY KEY,
    id_area INT NOT NULL,
    pasillo VARCHAR(50) NOT NULL,
    estante VARCHAR(50) NOT NULL,
    nivel VARCHAR(50) NOT NULL,
    codigo_ubicacion VARCHAR(100) UNIQUE,
    FOREIGN KEY (id_area) REFERENCES areas(id_area)
);

CREATE TABLE inventarios (
    id_inventario INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    id_ubicacion INT NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto),
    FOREIGN KEY (id_ubicacion) REFERENCES ubicaciones(id_ubicacion),
    UNIQUE (id_producto, id_ubicacion)
);

CREATE TABLE entradas (
    id_entrada INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME NOT NULL,
    id_empleado INT NOT NULL,
    id_area INT NOT NULL,
    observaciones TEXT,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado),
    FOREIGN KEY (id_area) REFERENCES areas(id_area)
);

CREATE TABLE detalle_entradas (
    id_detalleE INT AUTO_INCREMENT PRIMARY KEY,
    id_entrada INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    FOREIGN KEY (id_entrada) REFERENCES entradas(id_entrada),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

CREATE TABLE salidas (
    id_salida INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME NOT NULL,
    id_empleado INT NOT NULL,
    id_area INT NOT NULL,
    observaciones TEXT,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado),
    FOREIGN KEY (id_area) REFERENCES areas(id_area)
);

CREATE TABLE detalle_salidas (
    id_detalleS INT AUTO_INCREMENT PRIMARY KEY,
    id_salida INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    FOREIGN KEY (id_salida) REFERENCES salidas(id_salida),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

CREATE TABLE bitacora (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    accion VARCHAR(255) NOT NULL,
    entidad VARCHAR(100) DEFAULT NULL,
    detalles TEXT DEFAULT NULL,
    usuario VARCHAR(100) DEFAULT NULL,
    fecha DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);


-- Roles
INSERT INTO roles (nombre) VALUES
('Administrador'),
('Encargado'),
('Empleado');

-- Áreas
INSERT INTO areas (nombre) VALUES
('Papelería'),
('Bodega'),
('Caja');

-- Categorías de productos
INSERT INTO categorias (nombre) VALUES
('Cuadernos'),
('Plumas'),
('Hojas'),
('Sobres'),
('Carpetas');

-- Empleados (equipo del proyecto)
INSERT INTO empleados (id_area, id_rol, nombre, ap, am, telefono, correo) VALUES
(1, 1, 'Jose Maria',    'Jimenez',   'Olvera',   '4421111111', 'chema@controlstock.com'),
(1, 2, 'Victor Manuel', 'De Vicente','Atanacio',  '4422222222', 'victor@controlstock.com'),
(1, 3, 'Sebastian',     'Martinez',  'Marcial',   '4423333333', 'sebas@controlstock.com');

INSERT INTO usuarios (nombre_usuario, password, ultima_modificacion, id_empleado) VALUES
('chema',  '$2y$12$njQMMvPivkNaHi2qZCZfgeW.x.7aRR8kHaAjkVsUFxSXKcvRXTbKO', CURDATE(), 1),
('victor', '$2y$12$HLPDPqH/8F.yFXOlIiIVZeXSdP0n1emHBJXFYFi3U1ub8UNVqPvIm', CURDATE(), 2),
('sebas',  '$2y$12$WDiHxPY8DMTQ6mwp92IqruBMQYQBIq8mAmhiS/W1rjDNAFT.FoSf2', CURDATE(), 3);

-- Productos 
INSERT INTO productos (nombre_producto, precio_unitario, stock_minimo, id_categoria) VALUES
('Cuaderno Profesional 100 Hojas', 50.00,  10, 1),
('Cuaderno Universitario',          35.00,  15, 1),
('Pluma Azul BIC',                  10.00,  20, 2),
('Pluma Negra BIC',                 10.00,  20, 2),
('Pluma Roja BIC',                  10.00,  20, 2),
('Hojas Blancas Carta (Resma)',     80.00,  5,  3),
('Hojas de Color Surtidas',         45.00,  8,  3),
('Sobre Manila Carta',              5.00,   30, 4),
('Sobre Blanco Oficio',             3.50,   30, 4),
('Carpeta de Argollas',             75.00,  10, 5);

-- Ubicaciones en el almacén
INSERT INTO ubicaciones (id_area, pasillo, estante, nivel, codigo_ubicacion) VALUES
(1, 'A', '1', '1', 'A-1-1'),
(1, 'A', '1', '2', 'A-1-2'),
(1, 'A', '2', '1', 'A-2-1'),
(2, 'B', '1', '1', 'B-1-1'),
(2, 'B', '1', '2', 'B-1-2'),
(2, 'B', '2', '1', 'B-2-1');

-- Inventario inicial (stock real de cada producto)
INSERT INTO inventarios (id_producto, id_ubicacion, stock_actual) VALUES
(1,  1, 50),   
(2,  1, 30),   
(3,  2, 100),  
(4,  2, 80),   
(5,  2, 60), 
(6,  3, 40), 
(7,  4, 25),  
(8,  5, 150),  
(9,  5, 120),  
(10, 6, 20);   

-- Entradas de ejemplo
INSERT INTO entradas (fecha, id_empleado, id_area, observaciones) VALUES
(NOW() - INTERVAL 5 DAY, 1, 1, 'Reposición inicial de inventario'),
(NOW() - INTERVAL 3 DAY, 2, 2, 'Compra de plumas al proveedor'),
(NOW(),                  1, 1, 'Entrada del día');

-- Detalle de entradas
INSERT INTO detalle_entradas (id_entrada, id_producto, cantidad) VALUES
(1, 1, 50),
(1, 2, 30),
(2, 3, 100),
(2, 4, 80),
(3, 6, 40);

-- Salidas de ejemplo
INSERT INTO salidas (fecha, id_empleado, id_area, observaciones) VALUES
(NOW() - INTERVAL 4 DAY, 3, 1, 'Surtido a caja'),
(NOW() - INTERVAL 2 DAY, 3, 2, 'Entrega a cliente'),
(NOW(),                  3, 1, 'Salida del día');

-- Detalle de salidas
INSERT INTO detalle_salidas (id_salida, id_producto, cantidad) VALUES
(1, 3, 20),
(1, 4, 15),
(2, 1, 10),
(3, 6, 5);

-- Bitácora de actividad inicial
INSERT INTO bitacora (accion, entidad, detalles, usuario, fecha, created_at, id_usuario) VALUES
('Crear', 'Entrada',  'Reposición inicial de inventario (50 Cuadernos Profesionales)',   'chema',  NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY, 1),
('Crear', 'Entrada',  'Compra de plumas al proveedor (100 Plumas Azul)',                  'victor', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY, 2),
('Crear', 'Salida',   'Surtido a caja (20 Plumas Azul)',                                  'sebas',  NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 4 DAY, 3),
('Crear', 'Salida',   'Entrega a cliente (10 Cuadernos Profesionales)',                   'sebas',  NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY, 3),
('Crear', 'Producto', 'Producto Carpeta de Argollas añadido al catálogo',                 'chema',  NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY, 1);
