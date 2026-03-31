<?php

namespace App\Http\Controllers;

use App\Models\Area;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AreaController extends Controller
{
    public function index()
    {
        return response()->json(Area::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:areas,nombre',
            'pasillo' => 'nullable|string|max:50',
            'estante' => 'nullable|string|max:50',
            'nivel' => 'nullable|string|max:50',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $payload = ['nombre' => $validated['nombre']];
            if (Schema::hasColumn('areas', 'created_at')) {
                $payload['created_at'] = now();
            }
            if (Schema::hasColumn('areas', 'updated_at')) {
                $payload['updated_at'] = now();
            }

            $area = Area::create($payload);

            if ($request->filled(['pasillo', 'estante', 'nivel'])) {
                $codigo = $validated['pasillo'] . '-' . $validated['estante'] . '-' . $validated['nivel'];
                \App\Models\Ubicacion::updateOrCreate(
                    ['codigo_ubicacion' => $codigo],
                    [
                        'id_area' => $area->id_area,
                        'pasillo' => $validated['pasillo'],
                        'estante' => $validated['estante'],
                        'nivel' => $validated['nivel'],
                    ]
                );
            }

            return response()->json($area->fresh(), 201);
        });
    }

    public function show($id)
    {
        $area = Area::findOrFail($id);
        $ubicacion = DB::table('ubicaciones')->where('id_area', $id)->first();
        $data = $area->toArray();
        $data['ubicacion_inicial'] = $ubicacion;
        return response()->json($data);
    }

    public function update(Request $request, $id)
    {
        $area = Area::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:areas,nombre,' . $id . ',id_area',
            'pasillo' => 'nullable|string|max:50',
            'estante' => 'nullable|string|max:50',
            'nivel' => 'nullable|string|max:50',
        ]);

        return DB::transaction(function () use ($area, $validated, $request) {
            $payload = ['nombre' => $validated['nombre']];
            if (Schema::hasColumn('areas', 'updated_at')) {
                $payload['updated_at'] = now();
            }

            $area->update($payload);

            if ($request->filled(['pasillo', 'estante', 'nivel'])) {
                $codigo = $validated['pasillo'] . '-' . $validated['estante'] . '-' . $validated['nivel'];
                \App\Models\Ubicacion::updateOrCreate(
                    ['id_area' => $area->id_area],
                    [
                        'pasillo' => $validated['pasillo'],
                        'estante' => $validated['estante'],
                        'nivel' => $validated['nivel'],
                        'codigo_ubicacion' => $codigo,
                    ]
                );
            }

            return response()->json($area->fresh());
        });
    }

    public function destroy($id)
    {
        $area = Area::findOrFail($id);

        $ubicacionesCount = DB::table('ubicaciones')->where('id_area', $id)->count();
        if ($ubicacionesCount > 0) {
            return response()->json([
                'message' => 'No se puede eliminar el area "' . $area->nombre . '" porque tiene ' . $ubicacionesCount . ' ubicaciones asignadas. Elimina primero las ubicaciones.'
            ], 422);
        }

        $empleadosCount = DB::table('empleados')->where('id_area', $id)->count();
        if ($empleadosCount > 0) {
            return response()->json([
                'message' => 'No se puede eliminar el area "' . $area->nombre . '" porque tiene ' . $empleadosCount . ' empleados asignados.'
            ], 422);
        }

        $area->delete();
        return response()->json(null, 204);
    }
}
