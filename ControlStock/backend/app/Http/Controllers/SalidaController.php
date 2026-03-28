<?php

namespace App\Http\Controllers;

use App\Models\Salida;
use Illuminate\Http\Request;

class SalidaController extends Controller
{
    public function index()
    {
        return response()->json(Salida::all());
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
            $id_ubicacion = $validated['id_ubicacion'];

            // 1. Verificar stock actual (id_producto, id_ubicacion)
            $inventario = \App\Models\Inventario::where('id_producto', $validated['id_producto'])
                ->where('id_ubicacion', $id_ubicacion)
                ->first();

            if (!$inventario || $inventario->stock_actual < $validated['cantidad']) {
                return response()->json(['message' => 'Stock insuficiente en esta ubicación'], 400);
            }

            // 2. Crear la salida (id_empleado, id_area, fecha)
            $salida = Salida::create([
                'id_empleado' => $validated['id_empleado'] ?? 1,
                'id_area' => $validated['id_area'] ?? 1,
                'fecha' => $request->fecha ?? now(),
                'observaciones' => $request->observaciones
            ]);

            // 3. Crear el detalle
            \App\Models\DetalleSalida::create([
                'id_salida' => $salida->id_salida,
                'id_producto' => $validated['id_producto'],
                'cantidad' => $validated['cantidad']
            ]);

            // 4. Actualizar inventario
            $inventario->stock_actual -= $validated['cantidad'];
            $inventario->save();

            // 5. Registrar en bitacora
            \App\Models\Bitacora::create([
                'accion' => "Salida de " . $validated['cantidad'] . " unidades del producto ID: " . $validated['id_producto'],
                'fecha' => now(),
                'id_usuario' => $request->id_usuario ?? 1
            ]);

            return response()->json([
                'message' => 'Salida registrada exitosamente',
                'data' => $salida->load('detalles')
            ], 201);
        });
    }

    public function show($id)
    {
        return response()->json(Salida::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Salida::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Salida::destroy($id);
        return response()->json(null, 204);
    }
}
