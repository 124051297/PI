<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Usuario;
use App\Models\Empleado;
use App\Models\Area;
use App\Models\Role;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;


    public function test_el_endpoint_de_estadisticas_del_dashboard_responde_exitosamente(): void
    {
        // 1. Preparación de datos 
        $area = Area::create(['nombre' => 'Test Area']);
        $rol = Role::create(['nombre' => 'administrador']);
        $empleado = Empleado::create([
            'nombre' => 'Test',
            'ap' => 'User',
            'id_area' => $area->id_area,
            'id_rol' => $rol->id_rol,
            'correo' => 'test@test.com'
        ]);
        $user = Usuario::create([
            'nombre_usuario' => 'testuser',
            'password' => bcrypt('password'),
            'id_empleado' => $empleado->id_empleado
        ]);

        // 2.  Hacemos la petición HTTP simulada como usuario autenticado.
        $response = $this->actingAs($user)->getJson('/api/dashboard/stats');

        // 3. Verificación  
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'totalProductos',
            'bajoStock',
            'entradasHoy',
            'salidasHoy',
            'movimientos',
            'productosBajoStock',
            'actividadReciente',
            'pieData'
        ]);
    }
}
