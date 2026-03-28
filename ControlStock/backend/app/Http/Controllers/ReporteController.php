<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;
use App\Models\Bitacora;

class ReporteController extends Controller
{
    public function generar(Request $request)
    {
        $tipo = $request->query('tipo', 'mes');
        $inicio = $request->query('inicio');
        $fin = $request->query('fin');

        $query = Bitacora::query()->orderBy('fecha', 'desc');

        if ($tipo === 'semana') {
            $query->where('fecha', '>=', now()->subWeek());
        } elseif ($tipo === 'mes') {
            $query->where('fecha', '>=', now()->subMonth());
        } elseif ($tipo === 'ano') {
            $query->where('fecha', '>=', now()->subYear());
        } elseif ($tipo === 'especifico' && $inicio) {
            $query->whereDate('fecha', $inicio);
        } elseif ($tipo === 'rango' && $inicio && $fin) {
            $query->whereBetween('fecha', [$inicio . ' 00:00:00', $fin . ' 23:59:59']);
        }

        $movimientos = $query->get();
        // Incluimos productos actuales como parte del reporte
        $inventario = Producto::all();

        return response()->json([
            'movimientos' => $movimientos,
            'inventario' => $inventario,
            'fecha_generacion' => now()->toDateTimeString()
        ]);
    }
}
