<?php

namespace App\Http\Controllers;

use App\Models\Salida;
use App\Models\Ubicacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalidaController extends Controller
{
    public function index()
    {
        $salidas = Salida::with('detalles.producto', 'empleado', 'area')->get();
        return response()->json($salidas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_empleado'  => 'required|exists:empleados,id_empleado',
            'id_area'      => 'required|exists:areas,id_area',
            'fecha'        => 'nullable|date',
            'observaciones'=> 'nullable|string|max:500',
            'items'        => 'required|array|min:1',
            'items.*.id_producto' => 'required|exists:productos,id_producto',
            'items.*.cantidad'    => 'required|integer|min:1',
            'items.*.id_ubicacion'=> 'nullable|exists:ubicaciones,id_ubicacion',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            // 1. Crear la salida principal
            $salida = Salida::create([
                'id_empleado'  => $validated['id_empleado'],
                'id_area'      => $validated['id_area'],
                'fecha'        => $validated['fecha'] ?? now(),
                'observaciones'=> $validated['observaciones'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                // 2. Determinar ubicación o buscar con stock
                $id_ubicacion = $item['id_ubicacion'] ?? null;
                
                if (!$id_ubicacion) {
                    $invConStock = \App\Models\Inventario::where('id_producto', $item['id_producto'])
                        ->where('stock_actual', '>=', $item['cantidad'])
                        ->orderByDesc('stock_actual')
                        ->first();
                    $id_ubicacion = $invConStock ? $invConStock->id_ubicacion : (Ubicacion::first()->id_ubicacion ?? 1);
                }

                // 3. Verificar stock actual
                $inventario = \App\Models\Inventario::where('id_producto', $item['id_producto'])
                    ->where('id_ubicacion', $id_ubicacion)
                    ->first();

                if (!$inventario || $inventario->stock_actual < $item['cantidad']) {
                    throw new \Exception("Stock insuficiente para el producto ID {$item['id_producto']} en la ubicación seleccionada.");
                }

                // 4. Crear el detalle
                \App\Models\DetalleSalida::create([
                    'id_salida'   => $salida->id_salida,
                    'id_producto' => $item['id_producto'],
                    'cantidad'    => $item['cantidad'],
                ]);

                // 5. Actualizar inventario
                $inventario->stock_actual -= $item['cantidad'];
                $inventario->save();

                // 6. Bitácora
                \App\Models\Bitacora::create([
                    'accion'     => "Salida: {$item['cantidad']} uds del producto ID: {$item['id_producto']}",
                    'fecha'      => now(),
                    'id_usuario' => $request->id_usuario ?? 1,
                ]);
            }

            return response()->json([
                'message' => 'Salida registrada exitosamente',
                'data'    => $salida->load('detalles.producto', 'area', 'empleado')
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
        return response()->json($item);
    }

    public function destroy($id)
    {
        $salida = Salida::findOrFail($id);
        \App\Models\DetalleSalida::where('id_salida', $id)->delete();
        $salida->delete();
        return response()->json(null, 204);
    }
}
