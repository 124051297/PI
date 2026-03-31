<?php

namespace App\Http\Controllers;

use App\Models\Salida;
use App\Models\Ubicacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
            $salida = Salida::create([
                'id_empleado' => $validated['id_empleado'],
                'id_area' => $validated['id_area'],
                'fecha' => $validated['fecha'] ?? now(),
                'observaciones' => $validated['observaciones'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $idUbicacion = $item['id_ubicacion'] ?? null;

                if (!$idUbicacion) {
                    $inventarioConStock = \App\Models\Inventario::where('id_producto', $item['id_producto'])
                        ->where('stock_actual', '>=', $item['cantidad'])
                        ->orderByDesc('stock_actual')
                        ->first();

                    $idUbicacion = $inventarioConStock?->id_ubicacion
                        ?? Ubicacion::where('id_area', $validated['id_area'])->value('id_ubicacion')
                        ?? Ubicacion::value('id_ubicacion');
                }

                if (!$idUbicacion) {
                    throw ValidationException::withMessages([
                        'items' => ['No existe una ubicacion registrada para procesar la salida.'],
                    ]);
                }

                $inventario = \App\Models\Inventario::where('id_producto', $item['id_producto'])
                    ->where('id_ubicacion', $idUbicacion)
                    ->first();

                if (!$inventario || $inventario->stock_actual < $item['cantidad']) {
                    throw ValidationException::withMessages([
                        'items' => ["Stock insuficiente para el producto ID {$item['id_producto']} en la ubicacion seleccionada."],
                    ]);
                }

                \App\Models\DetalleSalida::create([
                    'id_salida' => $salida->id_salida,
                    'id_producto' => $item['id_producto'],
                    'cantidad' => $item['cantidad'],
                ]);

                $inventario->stock_actual -= $item['cantidad'];
                $inventario->save();

                \App\Models\Bitacora::create([
                    'accion' => "Salida: {$item['cantidad']} uds del producto ID: {$item['id_producto']}",
                    'fecha' => now(),
                    'id_usuario' => Auth::user()?->id_usuario,
                ]);
            }

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
