<?php

namespace App\Http\Controllers;

use App\Models\Salida;
use App\Models\Ubicacion;
use App\Support\SystemLogger;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SalidaController extends Controller
{
    public function index()
    {
        $salidas = Salida::with('detalles.producto', 'empleado', 'area')->orderByDesc('fecha')->get();
        return response()->json($salidas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_empleado' => 'required|exists:empleados,id_empleado',
            'id_area' => 'required|exists:areas,id_area',
            'fecha' => 'nullable|date',
            'observaciones' => 'nullable|string|max:500',
            'items' => 'required|array|min:1',
            'items.*.id_producto' => 'required|exists:productos,id_producto',
            'items.*.cantidad' => 'required|integer|min:1',
            'items.*.id_ubicacion' => 'nullable|exists:ubicaciones,id_ubicacion',
        ]);

        return DB::transaction(function () use ($validated) {
            $fechaMovimiento = !empty($validated['fecha'])
                ? Carbon::parse($validated['fecha'])->setTimeFrom(now())
                : now();

            $salida = Salida::create([
                'id_empleado' => $validated['id_empleado'],
                'id_area' => $validated['id_area'],
                'fecha' => $fechaMovimiento,
                'observaciones' => $validated['observaciones'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $idUbicacion = $item['id_ubicacion'] ?? null;
                $cantidadSolicitada = (int)$item['cantidad'];

                if ($idUbicacion) {
                    // Validacion de stock total
                    
                    $stockTotal = \App\Models\Inventario::where('id_producto', $item['id_producto'])->sum('stock_actual');

                    if ($stockTotal < $cantidadSolicitada) {
                        throw ValidationException::withMessages([
                            'items' => ["El sistema indica que solo hay $stockTotal unidades en total de este producto. No puedes retirar $cantidadSolicitada."],
                        ]);
                    }

                    $inventario = \App\Models\Inventario::firstOrCreate(
                        ['id_producto' => $item['id_producto'], 'id_ubicacion' => $idUbicacion],
                        ['stock_actual' => 0]
                    );

                    \App\Models\DetalleSalida::create([
                        'id_salida' => $salida->id_salida,
                        'id_producto' => $item['id_producto'],
                        'cantidad' => $cantidadSolicitada,
                        'id_ubicacion' => $idUbicacion,
                    ]);

                    $inventario->stock_actual -= $cantidadSolicitada;
                    $inventario->save();
                } else {
                    // Descuento automatico por stock disponible
                    $inventarios = \App\Models\Inventario::where('id_producto', $item['id_producto'])
                        ->where('stock_actual', '>', 0)
                        ->orderByDesc('stock_actual')
                        ->get();

                    $stockTotal = $inventarios->sum('stock_actual');

                    if ($stockTotal < $cantidadSolicitada) {
                        throw ValidationException::withMessages([
                            'items' => ["Stock total insuficiente para el producto ID {$item['id_producto']}. Requerido: $cantidadSolicitada, Disponible total: $stockTotal."],
                        ]);
                    }

                    $pendiente = $cantidadSolicitada;
                    foreach ($inventarios as $inv) {
                        if ($pendiente <= 0) break;

                        $aDescontar = min($inv->stock_actual, $pendiente);
                        
                        \App\Models\DetalleSalida::create([
                            'id_salida' => $salida->id_salida,
                            'id_producto' => $item['id_producto'],
                            'cantidad' => $aDescontar,
                            'id_ubicacion' => $inv->id_ubicacion,
                        ]);

                        $inv->stock_actual -= $aDescontar;
                        $inv->save();
                        
                        $pendiente -= $aDescontar;
                    }
                }
            }

            SystemLogger::log(
                'Registrar salida',
                'Salida',
                'Se registró la salida #' . $salida->id_salida . ' en el área ' . ($salida->area?->nombre ?? 'N/A') . ' con ' . count($validated['items']) . ' tipo(s) de producto.'
            );

            return response()->json([
                'message' => 'Salida registrada exitosamente',
                'data' => $salida->load('detalles.producto', 'area', 'empleado'),
            ], 201);
        });
    }

    public function show($id)
    {
        return response()->json(Salida::with('detalles.producto', 'empleado', 'area')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Salida::findOrFail($id);
        $item->update($request->only(['fecha', 'observaciones', 'id_empleado', 'id_area']));
        SystemLogger::log(
            'Actualizar salida',
            'Salida',
            'Se actualizó la salida #' . $item->id_salida . '.'
        );
        return response()->json($item);
    }

    public function destroy($id)
    {
        $salida = Salida::findOrFail($id);
        \App\Models\DetalleSalida::where('id_salida', $id)->delete();
        $salida->delete();
        SystemLogger::log(
            'Eliminar salida',
            'Salida',
            'Se eliminó la salida #' . $id . '.'
        );
        return response()->json(null, 204);
    }
}
