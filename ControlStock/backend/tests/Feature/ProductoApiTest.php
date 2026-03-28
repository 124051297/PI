<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Usuario;
use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Empleado;
use App\Models\Area;
use App\Models\Role;

class ProductoApiTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();

    
        $area = Area::create(['nombre' => 'Test Area']);
        $rol = Role::create(['nombre' => 'administrador']);
        $empleado = Empleado::create([
            'nombre' => 'Test',
            'ap' => 'User',
            'id_area' => $area->id_area,
            'id_rol' => $rol->id_rol
        ]);

        //  usuario de prueba
        $this->user = Usuario::create([
            'nombre_usuario' => 'testuser',
            'password' => bcrypt('password'),
            'id_empleado' => $empleado->id_empleado
        ]);

        // Categoría 
        Categoria::create(['nombre' => 'Test Category']);
    }

    public function test_se_pueden_listar_los_productos(): void
    {
        // 1. DB
        Producto::create([
            'nombre_producto' => 'Producto 1',
            'precio_unitario' => 10.50,
            'stock_minimo' => 5,
            'id_categoria' => 1
        ]);

        // 2.llamamos al controlador de la API
        $response = $this->actingAs($this->user)->getJson('/api/productos');

        // 3. Comprobamos 
        $response->assertStatus(200);
        $response->assertJsonCount(1); 
        $response->assertJsonFragment(['nombre' => 'Producto 1']);
    }

    public function test_se_puede_crear_un_producto(): void
    {
        // 1.Datos para el nuevo producto 
        $data = [
            'nombre' => 'Nuevo Producto',
            'precio' => 15.00,
            'stockMinimo' => 10,
            'id_categoria' => 1
        ];

        // 2.Hacemos la petición POST
        $response = $this->actingAs($this->user)->postJson('/api/productos', $data);

        // 3. Validamos 
        $response->assertStatus(201);
        $this->assertDatabaseHas('productos', [
            'nombre_producto' => 'Nuevo Producto',
            'precio_unitario' => 15.00
        ]);
    }
}
