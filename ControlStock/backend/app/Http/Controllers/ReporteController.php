<?php

namespace App\Http\Controllers;

use App\Models\Bitacora;
use App\Models\Entrada;
use App\Models\Producto;
use App\Models\Salida;
use Illuminate\Http\Request;

class ReporteController extends Controller
{
    public function generar(Request $request)
    {
        $tipo = $request->query('tipo', 'mes');
        $inicio = $request->query('inicio');
        $fin = $request->query('fin');

        $query = Bitacora::with('usuario.empleado')->orderByDesc('fecha');

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

        $movimientos = $query->get()->map(function ($log) {
            return [
                'id' => $log->id_log,
                'accion' => $log->accion,
                'entidad' => $log->entidad ?: $this->inferEntity($log->accion),
                'detalles' => $log->detalles ?: 'Sin detalles adicionales',
                'usuario' => $log->usuario ? ($log->usuario->empleado ? $log->usuario->empleado->nombre : $log->usuario->nombre_usuario) : 'Sistema',
                'fecha' => optional($log->fecha)->format('Y-m-d H:i:s') ?? (string) $log->fecha,
            ];
        })->values();

        $inventario = Producto::all()->map(function ($producto) {
            return [
                'codigo' => $producto->codigo,
                'nombre' => $producto->nombre,
                'categoria' => $producto->categoria,
                'stock' => $producto->stock,
                'stock_minimo' => $producto->stockMinimo,
                'precio' => $producto->precio,
                'area' => $producto->area,
                'ubicacion' => $producto->ubicacion,
            ];
        })->values();

        $summary = [
            'total_movimientos' => $movimientos->count(),
            'total_productos' => $inventario->count(),
            'total_entradas' => Entrada::count(),
            'total_salidas' => Salida::count(),
            'productos_bajo_stock' => $inventario->filter(fn ($item) => $item['stock'] < $item['stock_minimo'])->count(),
        ];

        return response()->json([
            'tipo' => $tipo,
            'inicio' => $inicio,
            'fin' => $fin,
            'periodo_label' => $this->buildPeriodLabel($tipo, $inicio, $fin),
            'fecha_generacion' => now()->format('Y-m-d H:i:s'),
            'summary' => $summary,
            'movimientos' => $movimientos,
            'inventario' => $inventario,
        ]);
    }

    private function inferEntity(string $accion): string
    {
        $accion = strtolower($accion);

        if (str_contains($accion, 'entrada')) {
            return 'Entrada';
        }
        if (str_contains($accion, 'salida')) {
            return 'Salida';
        }
        if (str_contains($accion, 'producto')) {
            return 'Producto';
        }

        return 'Sistema';
    }

    private function buildPeriodLabel(string $tipo, ?string $inicio, ?string $fin): string
    {
        return match ($tipo) {
            'semana' => 'Última semana',
            'mes' => 'Último mes',
            'ano' => 'Último año',
            'especifico' => $inicio ? 'Fecha: ' . $inicio : 'Fecha específica',
            'rango' => ($inicio && $fin) ? "Del {$inicio} al {$fin}" : 'Rango personalizado',
            default => 'Periodo personalizado',
        };
    }
}
