<?php

namespace App\Http\Controllers;

use App\Models\Entrada;
use Illuminate\Http\Request;

class EntradaController extends Controller
{
    public function index()
    {
        return response()->json(Entrada::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_producto' => 'required|exists:productos,id_producto',
            'cantidad' => 'required|integer|min:1',
            'id_ubicacion' => 'required|exists:ubicaciones,id_ubicacion',
            'id_empleado' => 'sometimes|exists:empleados,id_empleado',
            'id_area' => 'sometimes|exists:areas,id_area'
        ]);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $request) {
            // 1. Crear la entrada principal (id_empleado, id_area, fecha)
            $entrada = Entrada::create([
                'id_empleado' => $validated['id_empleado'] ?? 1,
                'id_area' => $validated['id_area'] ?? 1,
                'fecha' => $request->fecha ?? now(),
                'observaciones' => $request->observaciones
            ]);

            // 2. Crear el detalle
            \App\Models\DetalleEntrada::create([
                'id_entrada' => $entrada->id_entrada,
                'id_producto' => $validated['id_producto'],
                'cantidad' => $validated['cantidad']
            ]);

            // 3. Actualizar o crear registro en inventarios (id_producto, id_ubicacion)
            $id_ubicacion = $validated['id_ubicacion'];
            $inventario = \App\Models\Inventario::where('id_producto', $validated['id_producto'])
                ->where('id_ubicacion', $id_ubicacion)
                ->first();

            if ($inventario) {
                $inventario->stock_actual += $validated['cantidad'];
                $inventario->save();
            } else {
                \App\Models\Inventario::create([
                    'id_producto' => $validated['id_producto'],
                    'id_ubicacion' => $id_ubicacion,
                    'stock_actual' => $validated['cantidad']
                ]);
            }

            // 4. Registrar en bitacora
            \App\Models\Bitacora::create([
                'accion' => "Entrada de " . $validated['cantidad'] . " unidades del producto ID: " . $validated['id_producto'],
                'fecha' => now(),
                'id_usuario' => $request->id_usuario ?? 1
            ]);

            return response()->json([
                'message' => 'Entrada registrada exitosamente',
                'data' => $entrada->load('detalles')
            ], 201);
        });
    }

    public function show($id)
    {
        return response()->json(Entrada::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Entrada::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Entrada::destroy($id);
        return response()->json(null, 204);
    }
}
