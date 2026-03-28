<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Usuario;
use App\Models\Producto;
use App\Models\Inventario;
use App\Models\Empleado;
use App\Models\Area;
use App\Models\Role;
use App\Models\Categoria;

class InventarioApiTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $area;
    protected $producto;

    protected function setUp(): void
    {
        parent::setUp();

        $this->area = Area::create(['nombre' => 'Test Area']);
        $rol = Role::create(['nombre' => 'administrador']);
        $empleado = Empleado::create([
            'nombre' => 'Test',
            'ap' => 'User',
            'id_area' => $this->area->id_area,
            'id_rol' => $rol->id_rol
        ]);
        $this->user = Usuario::create([
            'nombre_usuario' => 'testuser',
            'password' => bcrypt('password'),
            'id_empleado' => $empleado->id_empleado
        ]);

        Categoria::create(['nombre' => 'Test Category']);
        $this->producto = Producto::create([
            'nombre_producto' => 'Producto Test',
            'precio_unitario' => 10.00,
            'stock_minimo' => 5,
            'id_categoria' => 1
        ]);
    }

    //Prueba que el registro de una entrada actualiza correctamente el stock.
    
    public function test_el_registro_de_entrada_actualiza_el_stock(): void
    {
        // 1. mercancía
        $data = [
            'id_producto' => $this->producto->id_producto,
            'cantidad' => 50,
            'fecha' => '2026-03-26'
        ];

        // 2. Llamada a la API de entradas
        $response = $this->actingAs($this->user)->postJson('/api/entradas', $data);

        // 3. Comprobamos el éxito de peticiones 
        $response->assertStatus(201);
        $this->assertDatabaseHas('inventarios', [
            'id_producto' => $this->producto->id_producto,
            'stock_actual' => 50
        ]);
    }


    public function test_el_registro_de_salida_actualiza_el_stock(): void
    {
        // 1.  Forzamos un stock 
        Inventario::create([
            'id_producto' => $this->producto->id_producto,
            'id_area' => $this->area->id_area,
            'stock_actual' => 100
        ]);

        $data = [
            'id_producto' => $this->producto->id_producto,
            'cantidad' => 30,
            'fecha' => '2026-03-26'
        ];

        // 2. Llamada a la API de salidas
        $response = $this->actingAs($this->user)->postJson('/api/salidas', $data);

        // 3.Comprobamos que el stock bajó
        $response->assertStatus(201);
        $this->assertDatabaseHas('inventarios', [
            'id_producto' => $this->producto->id_producto,
            'stock_actual' => 70
        ]);
    }

    public function test_la_salida_falla_si_hay_stock_insuficiente(): void
    {
        // 1 Ponemos stock en 10
        Inventario::create([
            'id_producto' => $this->producto->id_producto,
            'id_area' => $this->area->id_area,
            'stock_actual' => 10
        ]);

        // 2. Intentamos retirar 50
        $data = [
            'id_producto' => $this->producto->id_producto,
            'cantidad' => 50,
            'fecha' => '2026-03-26'
        ];

        $response = $this->actingAs($this->user)->postJson('/api/salidas', $data);

        // 3.
        $response->assertStatus(400);
    }
}
