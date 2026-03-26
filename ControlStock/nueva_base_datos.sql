CREATE DATABASE IF NOT EXISTS controlstock;
USE controlstock;

-- CATALOGO
create table if not exists roles (
    id_rol int auto_increment primary key,
    nombre varchar(100) not null
);

create table if not exists areas (
    id_area int auto_increment primary key,
    nombre varchar(100) not null
);

create table if not exists categorias (
    id_categoria int auto_increment primary key,
    nombre varchar(100) not null
);

-- EMPLEADOS
create table if not exists empleados (
    id_empleado int auto_increment primary key,
    id_area int not null,
    id_rol int not null,
    nombre varchar(100) not null,
    ap varchar(70) not null,
    am varchar(70),
    telefono varchar(20) unique,
    correo varchar(150) unique,
    foreign key (id_area) references areas(id_area),
    foreign key (id_rol) references roles(id_rol)
);

-- USUARIOS
create table if not exists usuarios (
    id_usuario int auto_increment primary key,
    nombre_usuario varchar(50) unique not null,
    password varchar(255) not null,
    ultima_modificacion date,
    id_empleado int not null,
    foreign key (id_empleado) references empleados(id_empleado)
);

-- PRODUCTOS
create table if not exists productos (
    id_producto int auto_increment primary key,
    nombre_producto varchar(250) not null,
    precio_unitario decimal(10,2) not null,
    stock_minimo int not null,
    id_categoria int not null,
    foreign key(id_categoria) references categorias(id_categoria)
);

-- INVENTARIOS
create table if not exists inventarios (
    id_inventario int auto_increment primary key,
    id_producto int not null,
    id_area int not null,
    stock_actual int not null default 0,
    foreign key (id_producto) references productos(id_producto),
    foreign key (id_area) references areas(id_area),
    unique (id_producto, id_area)
);

-- ENTRADAS
create table if not exists entradas (
    id_entrada int auto_increment primary key,
    fecha datetime not null,
    id_empleado int not null,
    id_area int not null,
    observaciones text,
    foreign key (id_empleado) references empleados(id_empleado),
    foreign key (id_area) references areas(id_area)
);

create table if not exists detalle_entradas(
    id_detalleE int auto_increment primary key,
    id_entrada int not null,
    id_producto int not null,
    cantidad int not null,
    foreign key (id_entrada) references entradas(id_entrada),
    foreign key (id_producto) references productos(id_producto)
);

-- SALIDAS
create table if not exists salidas (
    id_salida int auto_increment primary key,
    fecha datetime not null,
    id_empleado int not null,
    id_area int not null,
    observaciones text,
    foreign key (id_empleado) references empleados(id_empleado),
    foreign key (id_area) references areas(id_area)
);

create table if not exists detalle_salidas(
    id_detalleS int auto_increment primary key,
    id_salida int not null,
    id_producto int not null,
    cantidad int not null,
    foreign key (id_salida) references salidas(id_salida),
    foreign key (id_producto) references productos(id_producto)
);

-- BITACORA
create table if not exists bitacora (
    id_log int auto_increment primary key,
    accion varchar(255) not null,
    fecha datetime not null,
    id_usuario int,
    foreign key (id_usuario) references usuarios(id_usuario)
);

-- ROLES
insert ignore into roles (nombre) values
('Administrador'),
('Encargado'),
('Empleado');

-- AREAS
insert ignore into areas (nombre) values
('Papeleria'),
('Bodega'),
('Caja');

-- CATEGORIAS
insert ignore into categorias (nombre) values
('Cuadernos'),
('Plumas'),
('Hojas');

-- EMPLEADOS
insert ignore into empleados
(id_area, id_rol, nombre, ap, am, telefono, correo)
values
(1,1,'Jose Maria','Jimenez','Olvera','4421111111','chema@controlstock.com'),
(1,2,'Victor Manuel','De Vicente','Atanacio','4422222222','victor@controlstock.com'),
(1,3,'Sebastian','Martinez','Marcial','4423333333','sebas@controlstock.com');

-- USUARIOS
insert ignore into usuarios
(nombre_usuario, password, ultima_modificacion, id_empleado)
values
('chema','admin123',curdate(),1),
('victor','encargado123',curdate(),2),
('sebas','empleado123',curdate(),3);

-- PRODUCTOS 
insert ignore into productos (nombre_producto, precio_unitario, stock_minimo, id_categoria)
values
('Cuaderno Profesional', 50.00, 10, 1),
('Pluma Azul', 10.00, 20, 2),
('Hojas Blancas', 80.00, 15, 3);

-- INVENTARIO INICIAL
insert ignore into inventarios (id_producto, id_area, stock_actual)
values
(1,1,50),
(2,1,100),
(3,2,70);

-- TOKENS DE SANCTUM
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
