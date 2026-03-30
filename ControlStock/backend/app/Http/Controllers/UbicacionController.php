<?php

namespace App\Http\Controllers;

use App\Models\Ubicacion;
use App\Models\Area;
use Illuminate\Http\Request;

class UbicacionController extends Controller
{
    public function index()
    {
        $ubicaciones = Ubicacion::all()->map(function ($ub) {
            $area = Area::find($ub->id_area);
            return [
                'id' => $ub->id_ubicacion,
                'id_area' => $ub->id_area,
                'area' => $area ? $area->nombre : 'Sin Área',
                'pasillo' => $ub->pasillo,
                'estante' => $ub->estante,
                'nivel' => $ub->nivel,
                'codigo_ubicacion' => $ub->codigo_ubicacion,
            ];
        });

        return response()->json($ubicaciones);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_area' => 'required|exists:areas,id_area',
            'pasillo' => 'required|string|max:50',
            'estante' => 'required|string|max:50',
            'nivel' => 'required|string|max:50',
        ]);

        $codigo = $validated['pasillo'] . '-' . $validated['estante'] . '-' . $validated['nivel'];

        $item = Ubicacion::create([
            'id_area' => $validated['id_area'],
            'pasillo' => $validated['pasillo'],
            'estante' => $validated['estante'],
            'nivel' => $validated['nivel'],
            'codigo_ubicacion' => $codigo,
        ]);

        return response()->json([
            'message' => 'Ubicación creada exitosamente',
            'data' => $item
        ], 201);
    }

    public function show($id)
    {
        $ubicacion = Ubicacion::findOrFail($id);
        return response()->json(['data' => $ubicacion]);
    }

    public function update(Request $request, $id)
    {
        $item = Ubicacion::findOrFail($id);

        $validated = $request->validate([
            'id_area' => 'sometimes|exists:areas,id_area',
            'pasillo' => 'sometimes|string|max:50',
            'estante' => 'sometimes|string|max:50',
            'nivel' => 'sometimes|string|max:50',
        ]);

        $item->update($validated);

        return response()->json([
            'message' => 'Ubicación actualizada exitosamente',
            'data' => $item
        ]);
    }

    public function destroy($id)
    {
        Ubicacion::destroy($id);
        return response()->json(null, 204);
    }
}
