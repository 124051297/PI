<?php

namespace App\Http\Controllers;

use App\Models\DetalleEntrada;
use Illuminate\Http\Request;

class DetalleEntradaController extends Controller
{
    public function index()
    {
        return response()->json(DetalleEntrada::all());
    }

    public function store(Request $request)
    {
        $item = DetalleEntrada::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(DetalleEntrada::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = DetalleEntrada::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        DetalleEntrada::destroy($id);
        return response()->json(null, 204);
    }
}
