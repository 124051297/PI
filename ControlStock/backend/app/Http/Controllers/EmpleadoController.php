<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use Illuminate\Http\Request;

class EmpleadoController extends Controller
{
    public function index()
    {
        return response()->json(Empleado::all());
    }

    public function store(Request $request)
    {
        $rolMap = ['administrador' => 1, 'encargado' => 2, 'empleado' => 3];
        $data = [
            'nombre' => $request->nombre,
            'correo' => $request->email ?? $request->correo,
            'telefono' => $request->telefono,
            'id_rol' => $rolMap[$request->rol] ?? 3,
            'id_area' => $request->id_area ?? 1
        ];
        $item = Empleado::create($data);
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Empleado::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Empleado::findOrFail($id);
        $rolMap = ['administrador' => 1, 'encargado' => 2, 'empleado' => 3];
        $data = [
            'nombre' => $request->nombre ?? $item->nombre,
            'correo' => $request->email ?? $request->correo ?? $item->correo,
            'telefono' => $request->telefono ?? $item->telefono,
            'id_rol' => $rolMap[$request->rol] ?? $item->id_rol,
            'id_area' => $request->id_area ?? $item->id_area
        ];
        $item->update($data);
        return response()->json($item);
    }

    public function destroy($id)
    {
        Empleado::destroy($id);
        return response()->json(null, 204);
    }
}
