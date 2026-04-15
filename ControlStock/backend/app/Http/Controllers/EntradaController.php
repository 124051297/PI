<?php

namespace App\Http\Controllers;

use App\Models\Entrada;
use App\Models\Ubicacion;
use App\Support\SystemLogger;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EntradaController extends Controller
{
    public function index()
    {
        $entradas = Entrada::with('detalles.producto', 'empleado', 'area')->orderByDesc('fecha')->get();
        return response()->json($entradas);
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

            $entrada = Entrada::create([
                'id_empleado' => $validated['id_empleado'],
                'id_area' => $validated['id_area'],
                'fecha' => $fechaMovimiento,
                'observaciones' => $validated['observaciones'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $idUbicacion = $item['id_ubicacion'] ?? null;
                if (!$idUbicacion) {
                    $idUbicacion = Ubicacion::where('id_area', $validated['id_area'])->value('id_ubicacion')
                        ?? Ubicacion::value('id_ubicacion');
                }

                if (!$idUbicacion) {
                    throw ValidationException::withMessages([
                        'items' => ['No existe una ubicación registrada para guardar la entrada.'],
                    ]);
                }

                \App\Models\DetalleEntrada::create([
                    'id_entrada' => $entrada->id_entrada,
                    'id_producto' => $item['id_producto'],
                    'cantidad' => $item['cantidad'],
                    'id_ubicacion' => $idUbicacion,
                ]);

                $inventario = \App\Models\Inventario::firstOrCreate(
                    ['id_producto' => $item['id_producto'], 'id_ubicacion' => $idUbicacion],
                    ['stock_actual' => 0]
                );
                $inventario->stock_actual += $item['cantidad'];
                $inventario->save();

            }

            SystemLogger::log(
                'Registrar entrada',
                'Entrada',
                'Se registró la entrada #' . $entrada->id_entrada . ' en el área ' . ($entrada->area?->nombre ?? 'N/A') . ' con ' . count($validated['items']) . ' producto(s).'
            );

            return response()->json([
                'message' => 'Entrada registrada exitosamente',
                'data' => $entrada->load('detalles.producto', 'area', 'empleado'),
            ], 201);
        });
    }

    public function show($id)
    {
        return response()->json(Entrada::with('detalles.producto', 'empleado', 'area')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Entrada::findOrFail($id);
        $item->update($request->only(['fecha', 'observaciones', 'id_empleado', 'id_area']));
        SystemLogger::log(
            'Actualizar entrada',
            'Entrada',
            'Se actualizó la entrada #' . $item->id_entrada . '.'
        );
        return response()->json($item);
    }

    public function destroy($id)
    {
        $entrada = Entrada::findOrFail($id);
        \App\Models\DetalleEntrada::where('id_entrada', $id)->delete();
        $entrada->delete();
        SystemLogger::log(
            'Eliminar entrada',
            'Entrada',
            'Se eliminó la entrada #' . $id . '.'
        );
        return response()->json(null, 204);
    }
}
