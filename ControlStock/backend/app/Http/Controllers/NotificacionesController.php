<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Bitacora;
use App\Models\Producto;

class NotificacionesController extends Controller
{
    public function index()
    {
        $notificaciones = [];
        $idCounter = 1;

        // Stock bajo detectado dinámicamente
        $productosBajoStock = Producto::leftJoin('inventarios', 'productos.id_producto', '=', 'inventarios.id_producto')
            ->where(function($query) {
                $query->whereColumn('inventarios.stock_actual', '<', 'productos.stock_minimo')
                      ->orWhereNull('inventarios.stock_actual');
            })
            ->select('productos.*', 'inventarios.stock_actual')
            ->get();

        foreach ($productosBajoStock as $producto) {
            $notificaciones[] = [
                'id' => 'lowstock_' . ($producto->id_producto ?? $idCounter++),
                'tipo' => 'warning',
                'titulo' => 'Alerta de Stock Bajo',
                'mensaje' => 'El producto "' . $producto->nombre_producto . '" tiene solo ' . ($producto->stock_actual ?? 0) . ' unidades (Mínimo: '.$producto->stock_minimo.')',
                'fecha' => now()->diffForHumans(),
                'leida' => false
            ];
        }

        // Historial (últimos 10 eventos relevantes) de Bitacora
        $historial = Bitacora::orderBy('fecha', 'desc')->take(10)->get();
        foreach ($historial as $mov) {
            $notificaciones[] = [
                'id' => 'log_' . ($mov->id_log ?? $idCounter++),
                'tipo' => 'info',
                'titulo' => 'Actividad: ' . $mov->accion,
                'mensaje' => $mov->accion,
                'fecha' => $mov->fecha,
                'leida' => false
            ];
        }

        return response()->json($notificaciones);
    }
}
