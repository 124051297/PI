<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Ubicacion;
use App\Support\SystemLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class AreaController extends Controller
{
    public function index()
    {
        return response()->json(
            Area::with('ubicaciones')
                ->get()
                ->map(fn (Area $area) => $this->formatAreaResponse($area))
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:areas,nombre',
            'pasillo' => 'nullable|string|max:50',
            'estante' => 'nullable|string|max:50',
            'nivel' => 'nullable|string|max:50',
            'ubicaciones' => 'nullable|array',
            'ubicaciones.*.id_ubicacion' => 'nullable|exists:ubicaciones,id_ubicacion',
            'ubicaciones.*.pasillo' => 'required_with:ubicaciones|string|max:50',
            'ubicaciones.*.estante' => 'required_with:ubicaciones|string|max:50',
            'ubicaciones.*.nivel' => 'required_with:ubicaciones|string|max:50',
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

            $ubicaciones = $this->extractUbicacionesPayload($validated, $request);
            $this->syncUbicaciones($area, $ubicaciones);

            SystemLogger::log(
                'Crear area',
                'Area',
                'Se creo el area "' . $area->nombre . '" con ' . $area->ubicaciones()->count() . ' ubicacion(es).'
            );

            return response()->json($this->formatAreaResponse($area->fresh('ubicaciones')), 201);
        });
    }

    public function show($id)
    {
        $area = Area::with('ubicaciones')->findOrFail($id);
        return response()->json($this->formatAreaResponse($area));
    }

    public function update(Request $request, $id)
    {
        $area = Area::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:areas,nombre,' . $id . ',id_area',
            'pasillo' => 'nullable|string|max:50',
            'estante' => 'nullable|string|max:50',
            'nivel' => 'nullable|string|max:50',
            'ubicaciones' => 'nullable|array',
            'ubicaciones.*.id_ubicacion' => 'nullable|exists:ubicaciones,id_ubicacion',
            'ubicaciones.*.pasillo' => 'required_with:ubicaciones|string|max:50',
            'ubicaciones.*.estante' => 'required_with:ubicaciones|string|max:50',
            'ubicaciones.*.nivel' => 'required_with:ubicaciones|string|max:50',
        ]);

        return DB::transaction(function () use ($area, $validated, $request) {
            $payload = ['nombre' => $validated['nombre']];
            if (Schema::hasColumn('areas', 'updated_at')) {
                $payload['updated_at'] = now();
            }

            $area->update($payload);

            $ubicaciones = $this->extractUbicacionesPayload($validated, $request);
            $this->syncUbicaciones($area, $ubicaciones);

            SystemLogger::log(
                'Actualizar area',
                'Area',
                'Se actualizo el area "' . $area->nombre . '" y sus ubicaciones.'
            );

            return response()->json($this->formatAreaResponse($area->fresh('ubicaciones')));
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

        $areaNombre = $area->nombre;
        $area->delete();

        SystemLogger::log(
            'Eliminar area',
            'Area',
            'Se elimino el area "' . $areaNombre . '".'
        );

        return response()->json(null, 204);
    }

    private function extractUbicacionesPayload(array $validated, Request $request): array
    {
        $ubicaciones = collect($validated['ubicaciones'] ?? [])
            ->filter(fn ($ubicacion) => !empty($ubicacion['pasillo']) && !empty($ubicacion['estante']) && !empty($ubicacion['nivel']))
            ->values()
            ->all();

        if (!empty($ubicaciones)) {
            return $ubicaciones;
        }

        if ($request->filled(['pasillo', 'estante', 'nivel'])) {
            return [[
                'pasillo' => $validated['pasillo'],
                'estante' => $validated['estante'],
                'nivel' => $validated['nivel'],
            ]];
        }

        return [];
    }

    private function syncUbicaciones(Area $area, array $ubicaciones): void
    {
        if (empty($ubicaciones)) {
            return;
        }

        $seenCodes = [];
        $keepIds = [];

        foreach ($ubicaciones as $ubicacionData) {
            $codigo = $this->buildCodigoUbicacion($area, $ubicacionData);

            if (in_array($codigo, $seenCodes, true)) {
                throw ValidationException::withMessages([
                    'ubicaciones' => ['No puedes registrar ubicaciones duplicadas dentro de la misma area.'],
                ]);
            }

            $seenCodes[] = $codigo;

            $payload = [
                'id_area' => $area->id_area,
                'pasillo' => $ubicacionData['pasillo'],
                'estante' => $ubicacionData['estante'],
                'nivel' => $ubicacionData['nivel'],
                'codigo_ubicacion' => $codigo,
            ];

            $ubicacion = null;
            if (!empty($ubicacionData['id_ubicacion'])) {
                $ubicacion = Ubicacion::where('id_area', $area->id_area)
                    ->where('id_ubicacion', $ubicacionData['id_ubicacion'])
                    ->first();
            }

            if ($ubicacion) {
                $ubicacion->update($payload);
            } else {
                $ubicacion = Ubicacion::create($payload);
            }

            $keepIds[] = $ubicacion->id_ubicacion;
        }

        $area->ubicaciones()
            ->whereNotIn('id_ubicacion', $keepIds)
            ->get()
            ->each(function (Ubicacion $ubicacion) {
                $tieneInventario = DB::table('inventarios')
                    ->where('id_ubicacion', $ubicacion->id_ubicacion)
                    ->exists();

                if ($tieneInventario) {
                    throw ValidationException::withMessages([
                        'ubicaciones' => ['No se puede eliminar una ubicacion que ya tiene inventario asociado.'],
                    ]);
                }

                $ubicacion->delete();
            });
    }

    private function buildCodigoUbicacion(Area $area, array $ubicacionData): string
    {
        return 'A' . $area->id_area . '-' . strtoupper(trim($ubicacionData['pasillo'])) . '-' . strtoupper(trim($ubicacionData['estante'])) . '-' . strtoupper(trim($ubicacionData['nivel']));
    }

    private function formatAreaResponse(Area $area): array
    {
        $data = $area->toArray();
        $data['ubicaciones'] = $area->ubicaciones->map(fn (Ubicacion $ubicacion) => [
            'id_ubicacion' => $ubicacion->id_ubicacion,
            'pasillo' => $ubicacion->pasillo,
            'estante' => $ubicacion->estante,
            'nivel' => $ubicacion->nivel,
            'codigo_ubicacion' => $ubicacion->codigo_ubicacion,
        ])->values()->all();
        $data['ubicacion_inicial'] = $data['ubicaciones'][0] ?? null;
        $data['total_ubicaciones'] = count($data['ubicaciones']);

        return $data;
    }
}
