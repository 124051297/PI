<?php

namespace App\Http\Controllers;

use App\Models\EstadoProducto;
use Illuminate\Http\Request;

class EstadoProductoController extends Controller
{
    public function index()
    {
        return response()->json(EstadoProducto::all());
    }

    public function store(Request $request)
    {
        $item = EstadoProducto::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(EstadoProducto::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = EstadoProducto::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        EstadoProducto::destroy($id);
        return response()->json(null, 204);
    }
}
