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
use App\Http\Controllers\BitacoraController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('areas', AreaController::class);
    Route::apiResource('categorias', CategoriaController::class);
    Route::apiResource('estados', EstadoProductoController::class);
    Route::apiResource('empleados', EmpleadoController::class);
    Route::apiResource('usuarios', UsuarioController::class);
    Route::post('/usuarios/{usuario}/foto-perfil', [UsuarioController::class, 'updatePhoto']);
    Route::apiResource('productos', ProductoController::class);
    Route::post('/validar-stock-ubicacion', [ProductoController::class, 'validarStockUbicacion']);
    Route::apiResource('entradas', EntradaController::class);
    Route::apiResource('salidas', SalidaController::class);
    Route::apiResource('ubicaciones', UbicacionController::class);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/reportes', [ReporteController::class, 'generar']);

    Route::get('/configuraciones', [ConfiguracionController::class, 'index']);
    Route::post('/configuraciones/logo', [ConfiguracionController::class, 'updateLogo']);
    Route::delete('/configuraciones/logo', [ConfiguracionController::class, 'resetLogo']);

    Route::get('/notificaciones', [NotificacionesController::class, 'index']);
    Route::post('/notificaciones', [NotificacionesController::class, 'store']);
    Route::put('/notificaciones/{id}', [NotificacionesController::class, 'update']);
    Route::delete('/notificaciones/{id}', [NotificacionesController::class, 'destroy']);
    Route::post('/notificaciones/mark-all-read', [NotificacionesController::class, 'markAllAsRead']);
    Route::get('/notificaciones/unread-count', [NotificacionesController::class, 'unreadCount']);

    Route::get('/bitacora', [BitacoraController::class, 'index']);
});


