<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\EstadoProductoController;
use App\Http\Controllers\EmpleadoController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\EntradaController;
use App\Http\Controllers\SalidaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\ConfiguracionController;
use App\Http\Controllers\NotificacionesController;
use App\Http\Controllers\UbicacionController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) { return $request->user(); });

    Route::apiResource('areas', AreaController::class);
    Route::apiResource('categorias', CategoriaController::class);
    Route::apiResource('estados', EstadoProductoController::class);
    Route::apiResource('empleados', EmpleadoController::class);
    Route::apiResource('usuarios', UsuarioController::class);
    Route::apiResource('productos', ProductoController::class);
    Route::apiResource('entradas', EntradaController::class);
    Route::apiResource('salidas', SalidaController::class);
    Route::apiResource('ubicaciones', UbicacionController::class);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/reportes', [ReporteController::class, 'generar']);
    
    // Configuraciones y Logo
    Route::get('/configuraciones', [ConfiguracionController::class, 'index']);
    Route::post('/configuraciones/logo', [ConfiguracionController::class, 'updateLogo']);

    // Notificaciones
    Route::get('/notificaciones', [NotificacionesController::class, 'index']);
});

Route::get('/test', function () {
    return response()->json([
        'mensaje' => 'API funcionando'
    ]);
});

use Illuminate\Support\Facades\DB;

Route::get('/db-test', function () {
    try {
        DB::connection()->getPdo();
        return response()->json([
            "mensaje" => "Conexión a base de datos correcta"
        ]);

    } catch (\Exception $e) {
        return response()->json([
            "mensaje" => "Error en la conexión a la base de datos"
        ]);
        
    }
});