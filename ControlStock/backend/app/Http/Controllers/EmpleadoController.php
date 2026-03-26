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
        $item = Empleado::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Empleado::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Empleado::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Empleado::destroy($id);
        return response()->json(null, 204);
    }
}
