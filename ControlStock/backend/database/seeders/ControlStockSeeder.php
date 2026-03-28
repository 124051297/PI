<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ControlStockSeeder extends Seeder
{
    public function run(): void
    {
        // Insertar Roles
        DB::table('roles')->insert([
            ['id_rol' => 1, 'nombre' => 'Administrador'],
            ['id_rol' => 2, 'nombre' => 'Encargado'],
            ['id_rol' => 3, 'nombre' => 'Empleado'],
        ]);

        // Insertar Areas
        DB::table('areas')->insert([
            ['id_area' => 1, 'nombre' => 'Papeleria'],
            ['id_area' => 2, 'nombre' => 'Bodega'],
            ['id_area' => 3, 'nombre' => 'Caja'],
        ]);

        // Insertar Categorias
        DB::table('categorias')->insert([
            ['id_categoria' => 1, 'nombre' => 'Cuadernos'],
            ['id_categoria' => 2, 'nombre' => 'Plumas'],
            ['id_categoria' => 3, 'nombre' => 'Hojas'],
        ]);

        // Insertar Empleados
        DB::table('empleados')->insert([
            [
                'id_empleado' => 1,
                'id_area' => 1,
                'id_rol' => 1,
                'nombre' => 'Jose Maria',
                'ap' => 'Jimenez',
                'am' => 'Olvera',
                'telefono' => '4421111111',
                'correo' => 'chema@controlstock.com'
            ],
            [
                'id_empleado' => 2,
                'id_area' => 1,
                'id_rol' => 2,
                'nombre' => 'Victor Manuel',
                'ap' => 'De Vicente',
                'am' => 'Atanacio',
                'telefono' => '4422222222',
                'correo' => 'victor@controlstock.com'
            ],
            [
                'id_empleado' => 3,
                'id_area' => 1,
                'id_rol' => 3,
                'nombre' => 'Sebastian',
                'ap' => 'Martinez',
                'am' => 'Marcial',
                'telefono' => '4423333333',
                'correo' => 'sebas@controlstock.com'
            ],
        ]);

        // Insertar Usuarios
        DB::table('usuarios')->insert([
            [
                'id_usuario' => 1,
                'nombre_usuario' => 'chema',
                'password' => Hash::make('admin123'),
                'ultima_modificacion' => now(),
                'id_empleado' => 1
            ],
            [
                'id_usuario' => 2,
                'nombre_usuario' => 'victor',
                'password' => Hash::make('encargado123'),
                'ultima_modificacion' => now(),
                'id_empleado' => 2
            ],
            [
                'id_usuario' => 3,
                'nombre_usuario' => 'sebas',
                'password' => Hash::make('empleado123'),
                'ultima_modificacion' => now(),
                'id_empleado' => 3
            ],
        ]);

        // Insertar Productos
        DB::table('productos')->insert([
            ['id_producto' => 1, 'nombre_producto' => 'Cuaderno Profesional', 'precio_unitario' => 50.00, 'stock_minimo' => 10, 'id_categoria' => 1],
            ['id_producto' => 2, 'nombre_producto' => 'Pluma Azul', 'precio_unitario' => 10.00, 'stock_minimo' => 20, 'id_categoria' => 2],
            ['id_producto' => 3, 'nombre_producto' => 'Hojas Blancas', 'precio_unitario' => 80.00, 'stock_minimo' => 15, 'id_categoria' => 3],
        ]);

        // Insertar Ubicaciones
        DB::table('ubicaciones')->insert([
            ['id_ubicacion' => 1, 'id_area' => 1, 'pasillo' => 'A', 'estante' => '1', 'nivel' => '1', 'codigo_ubicacion' => 'A-1-1'],
            ['id_ubicacion' => 2, 'id_area' => 1, 'pasillo' => 'A', 'estante' => '1', 'nivel' => '2', 'codigo_ubicacion' => 'A-1-2'],
            ['id_ubicacion' => 3, 'id_area' => 2, 'pasillo' => 'B', 'estante' => '2', 'nivel' => '1', 'codigo_ubicacion' => 'B-2-1'],
        ]);

        // Insertar Inventarios
        DB::table('inventarios')->insert([
            ['id_producto' => 1, 'id_ubicacion' => 1, 'stock_actual' => 50],
            ['id_producto' => 2, 'id_ubicacion' => 2, 'stock_actual' => 100],
            ['id_producto' => 3, 'id_ubicacion' => 3, 'stock_actual' => 70],
        ]);

        // --- Generar Movimientos Históricos para Dashboard ---
        
        // Entradas Históricas (Últimos meses)
        DB::table('entradas')->insert([
            ['id_entrada' => 1, 'fecha' => now()->subMonths(3), 'id_empleado' => 1, 'id_area' => 1, 'observaciones' => 'Carga inicial'],
            ['id_entrada' => 2, 'fecha' => now()->subMonths(2), 'id_empleado' => 2, 'id_area' => 1, 'observaciones' => 'Reabastecimiento mensual'],
            ['id_entrada' => 3, 'fecha' => now()->subMonths(1), 'id_empleado' => 1, 'id_area' => 2, 'observaciones' => 'Nuevo lote'],
            ['id_entrada' => 4, 'fecha' => now()->subDays(2), 'id_empleado' => 3, 'id_area' => 1, 'observaciones' => 'Entrada reciente'],
            ['id_entrada' => 5, 'fecha' => now(), 'id_empleado' => 1, 'id_area' => 1, 'observaciones' => 'Entrada de hoy'],
        ]);

        DB::table('detalle_entradas')->insert([
            ['id_entrada' => 1, 'id_producto' => 1, 'cantidad' => 20],
            ['id_entrada' => 2, 'id_producto' => 2, 'cantidad' => 50],
            ['id_entrada' => 3, 'id_producto' => 3, 'cantidad' => 30],
            ['id_entrada' => 4, 'id_producto' => 1, 'cantidad' => 10],
            ['id_entrada' => 5, 'id_producto' => 2, 'cantidad' => 15],
        ]);

        // Salidas Históricas (Últimos meses)
        DB::table('salidas')->insert([
            ['id_salida' => 1, 'fecha' => now()->subMonths(2), 'id_empleado' => 3, 'id_area' => 1, 'observaciones' => 'Venta mostrador'],
            ['id_salida' => 2, 'fecha' => now()->subMonths(1), 'id_empleado' => 2, 'id_area' => 3, 'observaciones' => 'Suministros oficina'],
            ['id_salida' => 3, 'fecha' => now()->subDays(5), 'id_empleado' => 1, 'id_area' => 1, 'observaciones' => 'Venta cliente'],
            ['id_salida' => 4, 'fecha' => now()->subDays(1), 'id_empleado' => 2, 'id_area' => 1, 'observaciones' => 'Salida por daño'],
            ['id_salida' => 5, 'fecha' => now(), 'id_empleado' => 3, 'id_area' => 1, 'observaciones' => 'Venta de hoy'],
        ]);

        DB::table('detalle_salidas')->insert([
            ['id_salida' => 1, 'id_producto' => 1, 'cantidad' => 5],
            ['id_salida' => 2, 'id_producto' => 2, 'cantidad' => 10],
            ['id_salida' => 3, 'id_producto' => 3, 'cantidad' => 2],
            ['id_salida' => 4, 'id_producto' => 1, 'cantidad' => 1],
            ['id_salida' => 5, 'id_producto' => 3, 'cantidad' => 5],
        ]);

        // Bitácora Inicial
        DB::table('bitacora')->insert([
            ['accion' => 'Migración de sistema completada', 'fecha' => now()->subMonths(3), 'id_usuario' => 1],
            ['accion' => 'Corte de inventario trimestral', 'fecha' => now()->subMonths(1), 'id_usuario' => 1],
            ['accion' => 'Actualización masiva de precios', 'fecha' => now()->subDays(3), 'id_usuario' => 2],
        ]);
    }
}
