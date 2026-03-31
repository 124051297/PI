<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ControlStockSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Roles ───
        DB::table('roles')->insert([
            ['id_rol' => 1, 'nombre' => 'Administrador'],
            ['id_rol' => 2, 'nombre' => 'Encargado'],
            ['id_rol' => 3, 'nombre' => 'Empleado'],
        ]);

        // ─── Áreas (6 áreas realistas de una papelería/almacén) ───
        DB::table('areas')->insert([
            ['id_area' => 1, 'nombre' => 'Papelería'],
            ['id_area' => 2, 'nombre' => 'Bodega Principal'],
            ['id_area' => 3, 'nombre' => 'Caja / Mostrador'],
            ['id_area' => 4, 'nombre' => 'Almacén Secundario'],
            ['id_area' => 5, 'nombre' => 'Oficina Administrativa'],
            ['id_area' => 6, 'nombre' => 'Exhibición'],
        ]);

        // ─── Categorías (8 categorías) ───
        DB::table('categorias')->insert([
            ['id_categoria' => 1, 'nombre' => 'Cuadernos'],
            ['id_categoria' => 2, 'nombre' => 'Plumas y Bolígrafos'],
            ['id_categoria' => 3, 'nombre' => 'Hojas y Papel'],
            ['id_categoria' => 4, 'nombre' => 'Material de Oficina'],
            ['id_categoria' => 5, 'nombre' => 'Adhesivos y Cintas'],
            ['id_categoria' => 6, 'nombre' => 'Carpetas y Folders'],
            ['id_categoria' => 7, 'nombre' => 'Artículos Escolares'],
            ['id_categoria' => 8, 'nombre' => 'Tecnología y Accesorios'],
        ]);

        // ─── Empleados ───
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
                'id_area' => 2,
                'id_rol' => 3,
                'nombre' => 'Sebastian',
                'ap' => 'Martinez',
                'am' => 'Marcial',
                'telefono' => '4423333333',
                'correo' => 'sebas@controlstock.com'
            ],
            [
                'id_empleado' => 4,
                'id_area' => 3,
                'id_rol' => 3,
                'nombre' => 'Ana Laura',
                'ap' => 'Garcia',
                'am' => 'Lopez',
                'telefono' => '4424444444',
                'correo' => 'ana@controlstock.com'
            ],
            [
                'id_empleado' => 5,
                'id_area' => 4,
                'id_rol' => 2,
                'nombre' => 'Carlos',
                'ap' => 'Hernandez',
                'am' => 'Ruiz',
                'telefono' => '4425555555',
                'correo' => 'carlos@controlstock.com'
            ],
        ]);

        // ─── Usuarios ───
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
            [
                'id_usuario' => 4,
                'nombre_usuario' => 'ana',
                'password' => Hash::make('empleado123'),
                'ultima_modificacion' => now(),
                'id_empleado' => 4
            ],
            [
                'id_usuario' => 5,
                'nombre_usuario' => 'carlos',
                'password' => Hash::make('encargado123'),
                'ultima_modificacion' => now(),
                'id_empleado' => 5
            ],
        ]);

        // ─── Productos (30 productos realistas de papelería) ───
        DB::table('productos')->insert([
            // Cuadernos (cat 1)
            ['id_producto' => 1,  'nombre_producto' => 'Cuaderno Profesional Scribe 100H', 'precio_unitario' => 52.00,  'stock_minimo' => 15, 'id_categoria' => 1],
            ['id_producto' => 2,  'nombre_producto' => 'Cuaderno Profesional Norma 200H',  'precio_unitario' => 78.50,  'stock_minimo' => 10, 'id_categoria' => 1],
            ['id_producto' => 3,  'nombre_producto' => 'Libreta Italiana Pasta Dura',       'precio_unitario' => 95.00,  'stock_minimo' => 8,  'id_categoria' => 1],
            ['id_producto' => 4,  'nombre_producto' => 'Cuaderno Forma Francesa Rayado',    'precio_unitario' => 35.00,  'stock_minimo' => 20, 'id_categoria' => 1],

            // Plumas y Bolígrafos (cat 2)
            ['id_producto' => 5,  'nombre_producto' => 'Pluma BIC Cristal Azul',            'precio_unitario' => 8.50,   'stock_minimo' => 50, 'id_categoria' => 2],
            ['id_producto' => 6,  'nombre_producto' => 'Pluma BIC Cristal Negra',            'precio_unitario' => 8.50,   'stock_minimo' => 40, 'id_categoria' => 2],
            ['id_producto' => 7,  'nombre_producto' => 'Pluma BIC Cristal Roja',             'precio_unitario' => 8.50,   'stock_minimo' => 30, 'id_categoria' => 2],
            ['id_producto' => 8,  'nombre_producto' => 'Bolígrafo Pilot G2 0.7mm',           'precio_unitario' => 45.00,  'stock_minimo' => 15, 'id_categoria' => 2],
            ['id_producto' => 9,  'nombre_producto' => 'Marcador Sharpie Fino Negro',        'precio_unitario' => 32.00,  'stock_minimo' => 20, 'id_categoria' => 2],

            // Hojas y Papel (cat 3)
            ['id_producto' => 10, 'nombre_producto' => 'Hojas Blancas Carta 500pz',          'precio_unitario' => 125.00, 'stock_minimo' => 12, 'id_categoria' => 3],
            ['id_producto' => 11, 'nombre_producto' => 'Hojas de Colores Carta 100pz',       'precio_unitario' => 85.00,  'stock_minimo' => 8,  'id_categoria' => 3],
            ['id_producto' => 12, 'nombre_producto' => 'Papel Bond Oficio 500pz',            'precio_unitario' => 145.00, 'stock_minimo' => 10, 'id_categoria' => 3],
            ['id_producto' => 13, 'nombre_producto' => 'Cartulina Bristol Blanca',            'precio_unitario' => 12.00,  'stock_minimo' => 30, 'id_categoria' => 3],

            // Material de Oficina (cat 4)
            ['id_producto' => 14, 'nombre_producto' => 'Grapadora Acme Mediana',              'precio_unitario' => 89.00,  'stock_minimo' => 5,  'id_categoria' => 4],
            ['id_producto' => 15, 'nombre_producto' => 'Grapas Estándar Caja 5000pz',         'precio_unitario' => 38.00,  'stock_minimo' => 10, 'id_categoria' => 4],
            ['id_producto' => 16, 'nombre_producto' => 'Perforadora 2 Orificios',             'precio_unitario' => 75.00,  'stock_minimo' => 5,  'id_categoria' => 4],
            ['id_producto' => 17, 'nombre_producto' => 'Clips Metálicos Caja 100pz',          'precio_unitario' => 22.00,  'stock_minimo' => 15, 'id_categoria' => 4],
            ['id_producto' => 18, 'nombre_producto' => 'Sacapuntas Eléctrico',                'precio_unitario' => 195.00, 'stock_minimo' => 3,  'id_categoria' => 4],

            // Adhesivos y Cintas (cat 5)
            ['id_producto' => 19, 'nombre_producto' => 'Cinta Adhesiva Transparente 48mm',    'precio_unitario' => 28.00,  'stock_minimo' => 20, 'id_categoria' => 5],
            ['id_producto' => 20, 'nombre_producto' => 'Pegamento en Barra Pritt 42g',        'precio_unitario' => 45.00,  'stock_minimo' => 25, 'id_categoria' => 5],
            ['id_producto' => 21, 'nombre_producto' => 'Silicón Líquido 250ml',               'precio_unitario' => 55.00,  'stock_minimo' => 10, 'id_categoria' => 5],
            ['id_producto' => 22, 'nombre_producto' => 'Post-it Notas Adhesivas 3x3 Amarillo','precio_unitario' => 42.00,  'stock_minimo' => 15, 'id_categoria' => 5],

            // Carpetas y Folders (cat 6)
            ['id_producto' => 23, 'nombre_producto' => 'Folder Manila Carta Paq. 100',        'precio_unitario' => 180.00, 'stock_minimo' => 5,  'id_categoria' => 6],
            ['id_producto' => 24, 'nombre_producto' => 'Carpeta de 3 Argollas 1 Pulg.',       'precio_unitario' => 65.00,  'stock_minimo' => 8,  'id_categoria' => 6],
            ['id_producto' => 25, 'nombre_producto' => 'Sobre Manila Oficio Paq. 50',         'precio_unitario' => 95.00,  'stock_minimo' => 10, 'id_categoria' => 6],

            // Artículos Escolares (cat 7)
            ['id_producto' => 26, 'nombre_producto' => 'Lápiz No.2 HB Caja 12pz',            'precio_unitario' => 48.00,  'stock_minimo' => 20, 'id_categoria' => 7],
            ['id_producto' => 27, 'nombre_producto' => 'Borrador Pelikan WS-30',              'precio_unitario' => 12.00,  'stock_minimo' => 25, 'id_categoria' => 7],
            ['id_producto' => 28, 'nombre_producto' => 'Colores Prismacolor 24pz',            'precio_unitario' => 185.00, 'stock_minimo' => 6,  'id_categoria' => 7],
            ['id_producto' => 29, 'nombre_producto' => 'Tijeras Escolares Barrilito',         'precio_unitario' => 25.00,  'stock_minimo' => 15, 'id_categoria' => 7],
            ['id_producto' => 30, 'nombre_producto' => 'Regla 30cm Transparente',             'precio_unitario' => 15.00,  'stock_minimo' => 20, 'id_categoria' => 7],

            // Tecnología y Accesorios (cat 8)
            ['id_producto' => 31, 'nombre_producto' => 'Calculadora Científica Casio FX-82',  'precio_unitario' => 320.00, 'stock_minimo' => 3,  'id_categoria' => 8],
            ['id_producto' => 32, 'nombre_producto' => 'Memoria USB 32GB Kingston',           'precio_unitario' => 145.00, 'stock_minimo' => 5,  'id_categoria' => 8],
            ['id_producto' => 33, 'nombre_producto' => 'Tinta para Impresora HP Negro',       'precio_unitario' => 380.00, 'stock_minimo' => 4,  'id_categoria' => 8],
            ['id_producto' => 34, 'nombre_producto' => 'Mouse Inalámbrico Logitech',          'precio_unitario' => 250.00, 'stock_minimo' => 3,  'id_categoria' => 8],
            ['id_producto' => 35, 'nombre_producto' => 'Tóner Samsung MLT-D101S',             'precio_unitario' => 550.00, 'stock_minimo' => 2,  'id_categoria' => 8],
        ]);

        // ─── Ubicaciones (18 ubicaciones distribuidas en las 6 áreas) ───
        DB::table('ubicaciones')->insert([
            // Papelería (Área 1) — 4 ubicaciones
            ['id_ubicacion' => 1,  'id_area' => 1, 'pasillo' => 'A', 'estante' => '1', 'nivel' => '1', 'codigo_ubicacion' => 'PAP-A1-N1'],
            ['id_ubicacion' => 2,  'id_area' => 1, 'pasillo' => 'A', 'estante' => '1', 'nivel' => '2', 'codigo_ubicacion' => 'PAP-A1-N2'],
            ['id_ubicacion' => 3,  'id_area' => 1, 'pasillo' => 'A', 'estante' => '2', 'nivel' => '1', 'codigo_ubicacion' => 'PAP-A2-N1'],
            ['id_ubicacion' => 4,  'id_area' => 1, 'pasillo' => 'B', 'estante' => '1', 'nivel' => '1', 'codigo_ubicacion' => 'PAP-B1-N1'],

            // Bodega Principal (Área 2) — 4 ubicaciones
            ['id_ubicacion' => 5,  'id_area' => 2, 'pasillo' => 'A', 'estante' => '1', 'nivel' => '1', 'codigo_ubicacion' => 'BOD-A1-N1'],
            ['id_ubicacion' => 6,  'id_area' => 2, 'pasillo' => 'A', 'estante' => '2', 'nivel' => '1', 'codigo_ubicacion' => 'BOD-A2-N1'],
            ['id_ubicacion' => 7,  'id_area' => 2, 'pasillo' => 'B', 'estante' => '1', 'nivel' => '1', 'codigo_ubicacion' => 'BOD-B1-N1'],
            ['id_ubicacion' => 8,  'id_area' => 2, 'pasillo' => 'B', 'estante' => '1', 'nivel' => '2', 'codigo_ubicacion' => 'BOD-B1-N2'],

            // Caja / Mostrador (Área 3) — 2 ubicaciones
            ['id_ubicacion' => 9,  'id_area' => 3, 'pasillo' => 'M', 'estante' => '1', 'nivel' => '1', 'codigo_ubicacion' => 'CAJ-M1-N1'],
            ['id_ubicacion' => 10, 'id_area' => 3, 'pasillo' => 'M', 'estante' => '2', 'nivel' => '1', 'codigo_ubicacion' => 'CAJ-M2-N1'],

            // Almacén Secundario (Área 4) — 3 ubicaciones
            ['id_ubicacion' => 11, 'id_area' => 4, 'pasillo' => 'C', 'estante' => '1', 'nivel' => '1', 'codigo_ubicacion' => 'ALM-C1-N1'],
            ['id_ubicacion' => 12, 'id_area' => 4, 'pasillo' => 'C', 'estante' => '1', 'nivel' => '2', 'codigo_ubicacion' => 'ALM-C1-N2'],
            ['id_ubicacion' => 13, 'id_area' => 4, 'pasillo' => 'C', 'estante' => '2', 'nivel' => '1', 'codigo_ubicacion' => 'ALM-C2-N1'],

            // Oficina Administrativa (Área 5) — 2 ubicaciones
            ['id_ubicacion' => 14, 'id_area' => 5, 'pasillo' => 'O', 'estante' => '1', 'nivel' => '1', 'codigo_ubicacion' => 'OFI-O1-N1'],
            ['id_ubicacion' => 15, 'id_area' => 5, 'pasillo' => 'O', 'estante' => '1', 'nivel' => '2', 'codigo_ubicacion' => 'OFI-O1-N2'],

            // Exhibición (Área 6) — 3 ubicaciones
            ['id_ubicacion' => 16, 'id_area' => 6, 'pasillo' => 'E', 'estante' => '1', 'nivel' => '1', 'codigo_ubicacion' => 'EXH-E1-N1'],
            ['id_ubicacion' => 17, 'id_area' => 6, 'pasillo' => 'E', 'estante' => '2', 'nivel' => '1', 'codigo_ubicacion' => 'EXH-E2-N1'],
            ['id_ubicacion' => 18, 'id_area' => 6, 'pasillo' => 'E', 'estante' => '2', 'nivel' => '2', 'codigo_ubicacion' => 'EXH-E2-N2'],
        ]);

        // ─── Inventarios (cada producto en su ubicación, con stocks variados) ───
        DB::table('inventarios')->insert([
            // Cuadernos — en Papelería y Bodega
            ['id_producto' => 1,  'id_ubicacion' => 1,  'stock_actual' => 45],   // Cuaderno Scribe → Papelería A1-N1
            ['id_producto' => 1,  'id_ubicacion' => 5,  'stock_actual' => 120],  // Cuaderno Scribe → Bodega A1-N1 (respaldo)
            ['id_producto' => 2,  'id_ubicacion' => 1,  'stock_actual' => 30],   // Cuaderno Norma → Papelería A1-N1
            ['id_producto' => 3,  'id_ubicacion' => 2,  'stock_actual' => 5],    // Libreta Italiana → Papelería A1-N2 (bajo stock!)
            ['id_producto' => 4,  'id_ubicacion' => 3,  'stock_actual' => 60],   // Cuaderno Francesa → Papelería A2-N1

            // Plumas — en Papelería, Caja, Exhibición
            ['id_producto' => 5,  'id_ubicacion' => 4,  'stock_actual' => 200],  // BIC Azul → Papelería B1-N1
            ['id_producto' => 5,  'id_ubicacion' => 9,  'stock_actual' => 25],   // BIC Azul → Caja M1-N1
            ['id_producto' => 6,  'id_ubicacion' => 4,  'stock_actual' => 150],  // BIC Negra → Papelería B1-N1
            ['id_producto' => 7,  'id_ubicacion' => 4,  'stock_actual' => 18],   // BIC Roja → Papelería B1-N1 (bajo stock!)
            ['id_producto' => 8,  'id_ubicacion' => 16, 'stock_actual' => 12],   // Pilot G2 → Exhibición E1-N1
            ['id_producto' => 9,  'id_ubicacion' => 16, 'stock_actual' => 35],   // Sharpie → Exhibición E1-N1

            // Hojas y Papel — en Bodega y Almacén Secundario
            ['id_producto' => 10, 'id_ubicacion' => 5,  'stock_actual' => 80],   // Hojas Blancas → Bodega A1-N1
            ['id_producto' => 10, 'id_ubicacion' => 11, 'stock_actual' => 40],   // Hojas Blancas → Almacén C1-N1
            ['id_producto' => 11, 'id_ubicacion' => 6,  'stock_actual' => 25],   // Hojas Colores → Bodega A2-N1
            ['id_producto' => 12, 'id_ubicacion' => 7,  'stock_actual' => 55],   // Papel Bond → Bodega B1-N1
            ['id_producto' => 13, 'id_ubicacion' => 6,  'stock_actual' => 100],  // Cartulina → Bodega A2-N1

            // Material de Oficina — en Oficina y Papelería
            ['id_producto' => 14, 'id_ubicacion' => 14, 'stock_actual' => 8],    // Grapadora → Oficina O1-N1
            ['id_producto' => 15, 'id_ubicacion' => 14, 'stock_actual' => 20],   // Grapas → Oficina O1-N1
            ['id_producto' => 16, 'id_ubicacion' => 14, 'stock_actual' => 4],    // Perforadora → Oficina O1-N1 (bajo stock!)
            ['id_producto' => 17, 'id_ubicacion' => 15, 'stock_actual' => 35],   // Clips → Oficina O1-N2
            ['id_producto' => 18, 'id_ubicacion' => 15, 'stock_actual' => 2],    // Sacapuntas Eléctrico → Oficina O1-N2 (bajo stock!)

            // Adhesivos — en Papelería y Exhibición
            ['id_producto' => 19, 'id_ubicacion' => 3,  'stock_actual' => 40],   // Cinta Adhesiva → Papelería A2-N1
            ['id_producto' => 20, 'id_ubicacion' => 17, 'stock_actual' => 15],   // Pegamento Pritt → Exhibición E2-N1 (bajo stock!)
            ['id_producto' => 21, 'id_ubicacion' => 17, 'stock_actual' => 22],   // Silicón → Exhibición E2-N1
            ['id_producto' => 22, 'id_ubicacion' => 9,  'stock_actual' => 30],   // Post-it → Caja M1-N1

            // Carpetas — en Bodega y Almacén
            ['id_producto' => 23, 'id_ubicacion' => 8,  'stock_actual' => 10],   // Folder Manila → Bodega B1-N2
            ['id_producto' => 24, 'id_ubicacion' => 12, 'stock_actual' => 18],   // Carpeta 3 Argollas → Almacén C1-N2
            ['id_producto' => 25, 'id_ubicacion' => 13, 'stock_actual' => 7],    // Sobre Manila → Almacén C2-N1 (bajo stock!)

            // Artículos Escolares — en Papelería, Exhibición
            ['id_producto' => 26, 'id_ubicacion' => 2,  'stock_actual' => 45],   // Lápiz HB → Papelería A1-N2
            ['id_producto' => 27, 'id_ubicacion' => 2,  'stock_actual' => 60],   // Borrador → Papelería A1-N2
            ['id_producto' => 28, 'id_ubicacion' => 18, 'stock_actual' => 3],    // Prismacolor → Exhibición E2-N2 (bajo stock!)
            ['id_producto' => 29, 'id_ubicacion' => 18, 'stock_actual' => 25],   // Tijeras → Exhibición E2-N2
            ['id_producto' => 30, 'id_ubicacion' => 3,  'stock_actual' => 40],   // Regla → Papelería A2-N1

            // Tecnología — en Exhibición y Oficina
            ['id_producto' => 31, 'id_ubicacion' => 16, 'stock_actual' => 6],    // Calculadora → Exhibición E1-N1
            ['id_producto' => 32, 'id_ubicacion' => 10, 'stock_actual' => 15],   // USB → Caja M2-N1
            ['id_producto' => 33, 'id_ubicacion' => 14, 'stock_actual' => 3],    // Tinta HP → Oficina O1-N1 (bajo stock!)
            ['id_producto' => 34, 'id_ubicacion' => 16, 'stock_actual' => 4],    // Mouse → Exhibición E1-N1
            ['id_producto' => 35, 'id_ubicacion' => 14, 'stock_actual' => 1],    // Tóner → Oficina O1-N1 (bajo stock!)
        ]);

        // ─── Entradas Históricas ───
        DB::table('entradas')->insert([
            ['id_entrada' => 1,  'fecha' => now()->subMonths(4), 'id_empleado' => 1, 'id_area' => 2, 'observaciones' => 'Carga inicial de inventario — apertura de bodega'],
            ['id_entrada' => 2,  'fecha' => now()->subMonths(3), 'id_empleado' => 1, 'id_area' => 1, 'observaciones' => 'Reabastecimiento papelería temporada escolar'],
            ['id_entrada' => 3,  'fecha' => now()->subMonths(3), 'id_empleado' => 5, 'id_area' => 4, 'observaciones' => 'Traslado a almacén secundario'],
            ['id_entrada' => 4,  'fecha' => now()->subMonths(2), 'id_empleado' => 2, 'id_area' => 1, 'observaciones' => 'Reabastecimiento mensual de plumas'],
            ['id_entrada' => 5,  'fecha' => now()->subMonths(2), 'id_empleado' => 3, 'id_area' => 6, 'observaciones' => 'Surtido de exhibición'],
            ['id_entrada' => 6,  'fecha' => now()->subMonths(1), 'id_empleado' => 1, 'id_area' => 2, 'observaciones' => 'Nuevo lote de hojas y papel bond'],
            ['id_entrada' => 7,  'fecha' => now()->subDays(15),  'id_empleado' => 2, 'id_area' => 5, 'observaciones' => 'Material de oficina para administración'],
            ['id_entrada' => 8,  'fecha' => now()->subDays(7),   'id_empleado' => 4, 'id_area' => 3, 'observaciones' => 'Resurtido de mostrador'],
            ['id_entrada' => 9,  'fecha' => now()->subDays(3),   'id_empleado' => 1, 'id_area' => 1, 'observaciones' => 'Pedido urgente de cuadernos'],
            ['id_entrada' => 10, 'fecha' => now()->subDays(1),   'id_empleado' => 5, 'id_area' => 6, 'observaciones' => 'Productos nuevos para exhibición'],
            ['id_entrada' => 11, 'fecha' => now(),               'id_empleado' => 1, 'id_area' => 1, 'observaciones' => 'Entrada del día — reposición general'],
        ]);

        DB::table('detalle_entradas')->insert([
            ['id_entrada' => 1,  'id_producto' => 1,  'cantidad' => 100],
            ['id_entrada' => 1,  'id_producto' => 10, 'cantidad' => 50],
            ['id_entrada' => 1,  'id_producto' => 12, 'cantidad' => 40],
            ['id_entrada' => 2,  'id_producto' => 5,  'cantidad' => 150],
            ['id_entrada' => 2,  'id_producto' => 26, 'cantidad' => 30],
            ['id_entrada' => 3,  'id_producto' => 10, 'cantidad' => 40],
            ['id_entrada' => 3,  'id_producto' => 24, 'cantidad' => 15],
            ['id_entrada' => 4,  'id_producto' => 5,  'cantidad' => 80],
            ['id_entrada' => 4,  'id_producto' => 6,  'cantidad' => 100],
            ['id_entrada' => 5,  'id_producto' => 8,  'cantidad' => 10],
            ['id_entrada' => 5,  'id_producto' => 28, 'cantidad' => 5],
            ['id_entrada' => 6,  'id_producto' => 10, 'cantidad' => 60],
            ['id_entrada' => 6,  'id_producto' => 13, 'cantidad' => 80],
            ['id_entrada' => 7,  'id_producto' => 14, 'cantidad' => 5],
            ['id_entrada' => 7,  'id_producto' => 17, 'cantidad' => 20],
            ['id_entrada' => 8,  'id_producto' => 22, 'cantidad' => 20],
            ['id_entrada' => 8,  'id_producto' => 32, 'cantidad' => 10],
            ['id_entrada' => 9,  'id_producto' => 1,  'cantidad' => 25],
            ['id_entrada' => 9,  'id_producto' => 4,  'cantidad' => 40],
            ['id_entrada' => 10, 'id_producto' => 31, 'cantidad' => 4],
            ['id_entrada' => 10, 'id_producto' => 34, 'cantidad' => 3],
            ['id_entrada' => 11, 'id_producto' => 2,  'cantidad' => 20],
            ['id_entrada' => 11, 'id_producto' => 20, 'cantidad' => 10],
        ]);

        // ─── Salidas Históricas ───
        DB::table('salidas')->insert([
            ['id_salida' => 1,  'fecha' => now()->subMonths(3), 'id_empleado' => 4, 'id_area' => 3, 'observaciones' => 'Venta mostrador — inicio del mes'],
            ['id_salida' => 2,  'fecha' => now()->subMonths(2), 'id_empleado' => 3, 'id_area' => 2, 'observaciones' => 'Suministros para oficina central'],
            ['id_salida' => 3,  'fecha' => now()->subMonths(2), 'id_empleado' => 4, 'id_area' => 3, 'observaciones' => 'Venta de temporada escolar'],
            ['id_salida' => 4,  'fecha' => now()->subMonths(1), 'id_empleado' => 2, 'id_area' => 1, 'observaciones' => 'Pedido especial cliente empresarial'],
            ['id_salida' => 5,  'fecha' => now()->subDays(20),  'id_empleado' => 1, 'id_area' => 1, 'observaciones' => 'Venta regular mostrador'],
            ['id_salida' => 6,  'fecha' => now()->subDays(10),  'id_empleado' => 4, 'id_area' => 3, 'observaciones' => 'Venta de fin de semana'],
            ['id_salida' => 7,  'fecha' => now()->subDays(5),   'id_empleado' => 2, 'id_area' => 6, 'observaciones' => 'Retiro de exhibición por daño'],
            ['id_salida' => 8,  'fecha' => now()->subDays(2),   'id_empleado' => 3, 'id_area' => 2, 'observaciones' => 'Envío a sucursal'],
            ['id_salida' => 9,  'fecha' => now()->subDays(1),   'id_empleado' => 1, 'id_area' => 1, 'observaciones' => 'Salida por merma'],
            ['id_salida' => 10, 'fecha' => now(),               'id_empleado' => 4, 'id_area' => 3, 'observaciones' => 'Venta de hoy'],
        ]);

        DB::table('detalle_salidas')->insert([
            ['id_salida' => 1,  'id_producto' => 5,  'cantidad' => 20],
            ['id_salida' => 1,  'id_producto' => 26, 'cantidad' => 10],
            ['id_salida' => 2,  'id_producto' => 10, 'cantidad' => 8],
            ['id_salida' => 2,  'id_producto' => 15, 'cantidad' => 5],
            ['id_salida' => 3,  'id_producto' => 1,  'cantidad' => 15],
            ['id_salida' => 3,  'id_producto' => 4,  'cantidad' => 10],
            ['id_salida' => 3,  'id_producto' => 27, 'cantidad' => 8],
            ['id_salida' => 4,  'id_producto' => 10, 'cantidad' => 20],
            ['id_salida' => 4,  'id_producto' => 23, 'cantidad' => 3],
            ['id_salida' => 5,  'id_producto' => 8,  'cantidad' => 2],
            ['id_salida' => 5,  'id_producto' => 9,  'cantidad' => 5],
            ['id_salida' => 6,  'id_producto' => 6,  'cantidad' => 15],
            ['id_salida' => 6,  'id_producto' => 22, 'cantidad' => 5],
            ['id_salida' => 7,  'id_producto' => 28, 'cantidad' => 2],
            ['id_salida' => 7,  'id_producto' => 34, 'cantidad' => 1],
            ['id_salida' => 8,  'id_producto' => 12, 'cantidad' => 10],
            ['id_salida' => 8,  'id_producto' => 11, 'cantidad' => 5],
            ['id_salida' => 9,  'id_producto' => 3,  'cantidad' => 3],
            ['id_salida' => 9,  'id_producto' => 7,  'cantidad' => 12],
            ['id_salida' => 10, 'id_producto' => 5,  'cantidad' => 10],
            ['id_salida' => 10, 'id_producto' => 32, 'cantidad' => 2],
        ]);

        // ─── Bitácora Inicial ───
        DB::table('bitacora')->insert([
            ['accion' => 'Migración de sistema completada',      'fecha' => now()->subMonths(4), 'id_usuario' => 1],
            ['accion' => 'Configuración de áreas y ubicaciones', 'fecha' => now()->subMonths(4), 'id_usuario' => 1],
            ['accion' => 'Carga masiva de productos iniciales',  'fecha' => now()->subMonths(4), 'id_usuario' => 1],
            ['accion' => 'Corte de inventario trimestral',       'fecha' => now()->subMonths(1), 'id_usuario' => 1],
            ['accion' => 'Actualización masiva de precios',      'fecha' => now()->subDays(10),  'id_usuario' => 2],
            ['accion' => 'Alta de nuevos empleados',             'fecha' => now()->subDays(5),   'id_usuario' => 1],
            ['accion' => 'Reconteo de inventario zona bodega',   'fecha' => now()->subDays(2),   'id_usuario' => 5],
        ]);
    }
}
