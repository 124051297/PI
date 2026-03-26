use controlstock

create table roles (
    id_rol int auto_increment primary key,
    nombre varchar(100) not null
);

create table areas (
    id_area int auto_increment primary key,
    nombre varchar(100) not null
);

create table categorias (
    id_categoria int auto_increment primary key,
    nombre varchar(100) not null
);

create table empleados (
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

create table usuarios (
    id_usuario int auto_increment primary key,
    nombre_usuario varchar(50) unique not null,
    password varchar(255) not null,
    ultima_modificacion date,
    id_empleado int not null,
    foreign key (id_empleado) references empleados(id_empleado)
);


create table productos (
    id_producto int auto_increment primary key,
    nombre_producto varchar(250) not null,
    precio_unitario decimal(10,2) not null,
    stock_minimo int not null,
    id_categoria int not null,
    foreign key(id_categoria) references categorias(id_categoria)
);

create table inventarios (
    id_inventario int auto_increment primary key,
    id_producto int not null,
    id_area int not null,
    stock_actual int not null default 0,
    foreign key (id_producto) references productos(id_producto),
    foreign key (id_area) references areas(id_area),
    unique (id_producto, id_area)
);

create table entradas (
    id_entrada int auto_increment primary key,
    fecha datetime not null,
    id_empleado int not null,
    id_area int not null,
    observaciones text,
    foreign key (id_empleado) references empleados(id_empleado),
    foreign key (id_area) references areas(id_area)
);

create table detalle_entradas(
    id_detalleE int auto_increment primary key,
    id_entrada int not null,
    id_producto int not null,
    cantidad int not null,
    foreign key (id_entrada) references entradas(id_entrada),
    foreign key (id_producto) references productos(id_producto)
);


create table salidas (
    id_salida int auto_increment primary key,
    fecha datetime not null,
    id_empleado int not null,
    id_area int not null,
    observaciones text,
    foreign key (id_empleado) references empleados(id_empleado),
    foreign key (id_area) references areas(id_area)
);

create table detalle_salidas(
    id_detalleS int auto_increment primary key,
    id_salida int not null,
    id_producto int not null,
    cantidad int not null,
    foreign key (id_salida) references salidas(id_salida),
    foreign key (id_producto) references productos(id_producto)
);

create table bitacora (
    id_log int auto_increment primary key,
    accion varchar(255) not null,
    fecha datetime not null,
    id_usuario int,
    foreign key (id_usuario) references usuarios(id_usuario)
);




insert into roles (nombre) values
('Administrador'),
('Encargado'),
('Empleado');

insert into areas (nombre) values
('Papeleria'),
('Bodega'),
('Caja');


insert into categorias (nombre) values
('Cuadernos'),
('Plumas'),
('Hojas');

insert into empleados
(id_area, id_rol, nombre, ap, am, telefono, correo)
values
(1,1,'Jose Maria','Jimenez','Olvera','4421111111','chema@controlstock.com'),
(1,2,'Victor Manuel','De Vicente','Atanacio','4422222222','victor@controlstock.com'),
(1,3,'Sebastian','Martinez','Marcial','4423333333','sebas@controlstock.com');


insert into usuarios
(nombre_usuario, password, ultima_modificacion, id_empleado)
values
('chema','admin123',curdate(),1),
('victor','encargado123',curdate(),2),
('sebas','empleado123',curdate(),3);

insert into productos (nombre_producto, precio_unitario, stock_minimo, id_categoria)
values
('Cuaderno Profesional', 50.00, 10, 1),
('Pluma Azul', 10.00, 20, 2),
('Hojas Blancas', 80.00, 15, 3);

insert into inventarios (id_producto, id_area, stock_actual)
values
(1,1,50),
(2,1,100),
(3,2,70);