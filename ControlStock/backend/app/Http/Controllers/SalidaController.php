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
                        'items' => ['No existe una ubicación registrada para procesar la salida.'],
                    ]);
                }

                $inventario = \App\Models\Inventario::where('id_producto', $item['id_producto'])
                    ->where('id_ubicacion', $idUbicacion)
                    ->first();

                if (!$inventario || $inventario->stock_actual < $item['cantidad']) {
                    throw ValidationException::withMessages([
                        'items' => ["Stock insuficiente para el producto ID {$item['id_producto']} en la ubicación seleccionada."],
                    ]);
                }

                \App\Models\DetalleSalida::create([
                    'id_salida' => $salida->id_salida,
                    'id_producto' => $item['id_producto'],
                    'cantidad' => $item['cantidad'],
                    'id_ubicacion' => $idUbicacion,
                ]);

                $inventario->stock_actual -= $item['cantidad'];
                $inventario->save();

            }

            SystemLogger::log(
                'Registrar salida',
                'Salida',
                'Se registró la salida #' . $salida->id_salida . ' en el área ' . ($salida->area?->nombre ?? 'N/A') . ' con ' . count($validated['items']) . ' producto(s).'
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
