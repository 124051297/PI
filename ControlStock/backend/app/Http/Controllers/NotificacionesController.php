<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HistorialMovimiento;
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

        // Historial (últimos 10 eventos relevantes)
        $historial = HistorialMovimiento::orderBy('created_at', 'desc')->take(10)->get();
        foreach ($historial as $mov) {
            $tipo = 'info';
            $titulo = 'Actividad en el Sistema';

            if ($mov->accion === 'Crear') {
                $tipo = 'success';
                $titulo = $mov->entidad === 'Producto' ? 'Nuevo producto agregado' : 'Registro de nuevo ' . strtolower($mov->entidad);
            } elseif ($mov->accion === 'Eliminar') {
                $tipo = 'alert';
                $titulo = $mov->entidad === 'Producto' ? 'Producto eliminado' : strtolower($mov->entidad) . ' eliminado';
            } elseif ($mov->accion === 'Modificar') {
                $tipo = 'info';
                $titulo = 'Modificación de ' . strtolower($mov->entidad);
            }

            $notificaciones[] = [
                'id' => $idCounter++,
                'tipo' => $tipo,
                'titulo' => $titulo,
                'mensaje' => $mov->detalles . ' (por ' . $mov->usuario . ')',
                'fecha' => $mov->created_at,
                'leida' => false
            ];
        }

        return response()->json($notificaciones);
    }
}
