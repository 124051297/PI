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

        // Stock bajo
        $productosBajoStock = Producto::whereColumn('stock', '<', 'stock_minimo')->get();
        foreach ($productosBajoStock as $producto) {
            $notificaciones[] = [
                'id' => $idCounter++,
                'tipo' => 'warning',
                'titulo' => 'Stock bajo detectado',
                'mensaje' => 'El producto "' . $producto->nombre_producto . '" tiene solo ' . $producto->stock . ' unidades en stock (Mínimo: '.$producto->stock_minimo.')',
                'fecha' => now()->toDateTimeString(),
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
