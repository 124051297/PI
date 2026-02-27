create database controlinventario;
use controlinventario;

create table jerarquia (
    id_jerarquia int auto_increment primary key,
    nombre varchar(255) not null
);
create table area (
    id_area int auto_increment primary key,
    nombre varchar(100)  not null
);
create table categoria (
    id_categoria int auto_increment primary key,
    nombre varchar(100) not null
);

create table estado_producto (
    id_estado int auto_increment primary key,
    nombre_estado varchar(250) not null
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

create table productos (
    id_producto int auto_increment primary key,
    nombre_producto varchar(250),
    stock int,
    precio_unitario decimal(10,2),
    stock_minimo int,
    id_area int,
    id_categoria int,
    id_estado int,
    foreign key(id_categoria) references categoria(id_categoria),
    foreign key (id_estado) references estado_producto(id_estado),
    foreign key (id_area) references area(id_area)
);

create table entradas (
    id_entrada int auto_increment primary key,
    fecha datetime,
    id_empleado int,
    id_area int,
    observaciones varchar(500),
    foreign key (id_empleado) references empleados(id_empleado),
    foreign key (id_area) references area(id_area)
);

create table detalle_entradas(
id_detalleE int primary key auto_increment,
id_producto int,
cantidad int,
id_entrada int,
foreign key (id_entrada) references entradas(id_entrada),
foreign key (id_producto) references productos(id_producto)
);

create table salidas (
    id_salida int auto_increment primary key,
    id_area int,
    id_empleado int,
    fecha datetime,
    observaciones varchar(500),
    foreign key (id_area) references area(id_area),
    foreign key (id_empleado) references empleados(id_empleado)
);


create table detalle_salidas(
id_detalleS int primary key auto_increment,
id_producto int,
cantidad int,
id_salida int,
foreign key (id_salida) references salidas(id_salida),
foreign key (id_producto) references productos(id_producto)
);

