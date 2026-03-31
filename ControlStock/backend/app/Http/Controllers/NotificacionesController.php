<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Request;

class NotificacionesController extends Controller
{
    public function index()
    {
        $this->generarAlertasStockBajo();

        return response()->json(\App\Models\Notificacion::orderByDesc('fecha')->get());
    }

    private function generarAlertasStockBajo()
    {
        $productosBajoStock = Producto::leftJoin('inventarios', 'productos.id_producto', '=', 'inventarios.id_producto')
            ->where(function ($query) {
                $query->whereColumn('inventarios.stock_actual', '<', 'productos.stock_minimo')
                    ->orWhereNull('inventarios.stock_actual');
            })
            ->select('productos.*', 'inventarios.stock_actual')
            ->get();

        foreach ($productosBajoStock as $producto) {
            $mensaje = 'El producto "' . $producto->nombre_producto . '" tiene solo ' . ($producto->stock_actual ?? 0) . ' unidades (Minimo: ' . $producto->stock_minimo . ')';

            $existe = \App\Models\Notificacion::where('titulo', 'Alerta de Stock Bajo')
                ->where('mensaje', $mensaje)
                ->exists();

            if (!$existe) {
                \App\Models\Notificacion::create([
                    'titulo' => 'Alerta de Stock Bajo',
                    'mensaje' => $mensaje,
                    'tipo' => 'warning',
                    'leida' => false,
                    'fecha' => now(),
                ]);
            }
        }
    }

    public function update(Request $request, $id)
    {
        $notificacion = \App\Models\Notificacion::findOrFail($id);
        $notificacion->update([
            'leida' => $request->boolean('leida', true),
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
        return response()->json(['message' => 'Todas marcadas como leidas']);
    }

    public function unreadCount()
    {
        return response()->json([
            'count' => \App\Models\Notificacion::where('leida', false)->count(),
        ]);
    }
}
