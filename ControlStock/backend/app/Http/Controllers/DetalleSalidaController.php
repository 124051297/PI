<?php

namespace App\Http\Controllers;

use App\Models\DetalleSalida;
use Illuminate\Http\Request;

class DetalleSalidaController extends Controller
{
    public function index()
    {
        return response()->json(DetalleSalida::all());
    }

    public function store(Request $request)
    {
        $item = DetalleSalida::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(DetalleSalida::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = DetalleSalida::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        DetalleSalida::destroy($id);
        return response()->json(null, 204);
    }
}
