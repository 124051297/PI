<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;
use App\Models\Entrada;
use App\Models\Salida;
use App\Models\DetalleEntrada;
use App\Models\DetalleSalida;
use App\Models\Bitacora;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalProductos = Producto::count();
        
        // Asumimos que el stock actual está en la tabla inventarios
        // Si no hay inventario registrado, el stock es 0
        $bajoStock = Producto::leftJoin('inventarios', 'productos.id_producto', '=', 'inventarios.id_producto')
            ->where(function($query) {
                $query->whereColumn('inventarios.stock_actual', '<', 'productos.stock_minimo')
                      ->orWhereNull('inventarios.stock_actual');
            })->count();

        $entradasHoy = Entrada::whereDate('fecha', Carbon::today())->count();
        $salidasHoy = Salida::whereDate('fecha', Carbon::today())->count();

        // Productos bajo stock (limit 5)
        $productosBajoStock = Producto::leftJoin('inventarios', 'productos.id_producto', '=', 'inventarios.id_producto')
            ->where(function($query) {
                $query->whereColumn('inventarios.stock_actual', '<', 'productos.stock_minimo')
                      ->orWhereNull('inventarios.stock_actual');
            })
            ->select('productos.*', 'inventarios.stock_actual')
            ->take(5)->get();

        // Movimientos recientes chart data
        // Simplified generic monthly movements
        $movimientos = [];
        $months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        for ($i = 6; $i >= 0; $i--) {
            $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
            $monthEnd = Carbon::now()->subMonths($i)->endOfMonth();
            $label = $months[$monthStart->month - 1];

            $entradas = Entrada::whereBetween('fecha', [$monthStart, $monthEnd])->count();
            $salidas = Salida::whereBetween('fecha', [$monthStart, $monthEnd])->count();

            $movimientos[] = [
                'mes' => $label,
                'entradas' => $entradas,
                'salidas' => $salidas,
            ];
        }

        $actividadReciente = Bitacora::orderBy('fecha', 'desc')->take(5)->get();

        $pieData = [
            ['name' => 'Stock Normal', 'value' => $totalProductos - $bajoStock],
            ['name' => 'Bajo Stock', 'value' => $bajoStock]
        ];

        return response()->json([
            'totalProductos' => $totalProductos,
            'bajoStock' => $bajoStock,
            'entradasHoy' => $entradasHoy,
            'salidasHoy' => $salidasHoy,
            'movimientos' => $movimientos,
            'productosBajoStock' => $productosBajoStock,
            'actividadReciente' => $actividadReciente,
            'pieData' => $pieData
        ]);
    }
}
