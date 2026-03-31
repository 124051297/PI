<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Bitacora;
use App\Models\Producto;

class NotificacionesController extends Controller
{
    public function index()
    {
        // 1. Generar notificaciones automáticas de stock bajo
        $this->generarAlertasStockBajo();

        // 2. Retornar todas las notificaciones de la tabla
        return response()->json(\App\Models\Notificacion::orderByDesc('fecha')->get());
    }

    private function generarAlertasStockBajo()
    {
        $productosBajoStock = Producto::leftJoin('inventarios', 'productos.id_producto', '=', 'inventarios.id_producto')
            ->where(function($query) {
                $query->whereColumn('inventarios.stock_actual', '<', 'productos.stock_minimo')
                      ->orWhereNull('inventarios.stock_actual');
            })
            ->select('productos.*', 'inventarios.stock_actual')
            ->get();

        foreach ($productosBajoStock as $producto) {
            $mensaje = 'El producto "' . $producto->nombre_producto . '" tiene solo ' . ($producto->stock_actual ?? 0) . ' unidades (Mínimo: '.$producto->stock_minimo.')';
            
            // Evitar duplicados (mismo producto y mismo mensaje sin leer)
            $existe = \App\Models\Notificacion::where('titulo', 'Alerta de Stock Bajo')
                ->where('mensaje', 'LIKE', '%' . $producto->nombre_producto . '%')
                ->where('leida', false)
                ->exists();

            if (!$existe) {
                \App\Models\Notificacion::create([
                    'titulo' => 'Alerta de Stock Bajo',
                    'mensaje' => $mensaje,
                    'tipo' => 'warning',
                    'leida' => false,
                    'fecha' => now()
                ]);
            }
        }
    }

    public function update(Request $request, $id)
    {
        $notificacion = \App\Models\Notificacion::findOrFail($id);
        $notificacion->update([
            'leida' => $request->leida ?? true
        ]);
        return response()->json($notificacion);
    }

    public function destroy($id)
    {
        $notificacion = \App\Models\Notificacion::findOrFail($id);
        $notificacion->delete();
        return response()->json(null, 204);
    }

    public function markAllAsRead()
    {
        \App\Models\Notificacion::where('leida', false)->update(['leida' => true]);
        return response()->json(['message' => 'Todas marcadas como leídas']);
    }

    public function unreadCount()
    {
        return response()->json([
            'count' => \App\Models\Notificacion::where('leida', false)->count()
        ]);
    }
}
