create database controlstock;
use controlstock;

create table jerarquia (
    id_jerarquia int auto_increment primary key,
    nombre varchar(255) not null
);

create table area (
    id_area int auto_increment primary key,
    nombre varchar(100) not null
);

create table categoria (
    id_categoria int auto_increment primary key,
    nombre varchar(100) not null
);

create table estado_producto (
    id_estado int auto_increment primary key,
    nombre_estado varchar(250) not null
);

create table proveedor (
    id_proveedor int auto_increment primary key,
    nombre_proveedor varchar(255) not null,
    razon_social varchar(255),
    correo varchar(255),
    telefono int
);

create table empleados (
    id_empleado int auto_increment primary key,
    id_area int,
    id_jerarquia int,
    nombre varchar(100),
    ap varchar(70),
    am varchar(70),
    telefono int unique,
    correo varchar(150) unique,
    foreign key (id_area) references area(id_area),
    foreign key (id_jerarquia) references jerarquia(id_jerarquia)
);

create table usuarios (
    id_usuario int auto_increment primary key,
    nombre_usuario varchar(50),
    contraseña varchar(50),
    ultima_modificacion date,
    id_empleado int,
    foreign key (id_empleado) references empleados(id_empleado)
);

create table producto (
    id_producto int auto_increment primary key,
    nombre_producto varchar(250),
    stock int,
    precio_unitario decimal(10,2),
    stock_minimo int,
    id_area int,
    foreign key (id_area) references area(id_area)
);

create table entrada (
    id_entrada int auto_increment primary key,
    fecha datetime,
    id_empleado int,
    id_area int,
    id_producto int,
    cantidad int,
    foreign key (id_empleado) references empleados(id_empleado),
    foreign key (id_area) references area(id_area),
    foreign key (id_producto) references producto(id_producto)
);

create table salida (
    id_salida int auto_increment primary key,
    id_area int,
    id_empleado int,
    fecha datetime,
    foreign key (id_area) references area(id_area),
    foreign key (id_empleado) references empleados(id_empleado)
);

