<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;
use App\Models\HistorialMovimiento;

class ReporteController extends Controller
{
    public function generar(Request $request)
    {
        $tipo = $request->query('tipo', 'mes');
        $inicio = $request->query('inicio');
        $fin = $request->query('fin');

        $query = HistorialMovimiento::query()->orderBy('created_at', 'desc');

        if ($tipo === 'semana') {
            $query->where('created_at', '>=', now()->subWeek());
        } elseif ($tipo === 'mes') {
            $query->where('created_at', '>=', now()->subMonth());
        } elseif ($tipo === 'ano') {
            $query->where('created_at', '>=', now()->subYear());
        } elseif ($tipo === 'especifico' && $inicio) {
            $query->whereDate('created_at', $inicio);
        } elseif ($tipo === 'rango' && $inicio && $fin) {
            $query->whereBetween('created_at', [$inicio . ' 00:00:00', $fin . ' 23:59:59']);
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
