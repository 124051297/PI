<?php

namespace App\Http\Controllers;

use App\Models\Salida;
use Illuminate\Http\Request;

class SalidaController extends Controller
{
    public function index()
    {
        return response()->json(Salida::all());
    }

    public function store(Request $request)
    {
        $item = Salida::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Salida::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Salida::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Salida::destroy($id);
        return response()->json(null, 204);
    }
}
