<?php

namespace App\Http\Controllers;

use App\Models\Entrada;
use Illuminate\Http\Request;

class EntradaController extends Controller
{
    public function index()
    {
        return response()->json(Entrada::all());
    }

    public function store(Request $request)
    {
        $item = Entrada::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Entrada::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Entrada::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Entrada::destroy($id);
        return response()->json(null, 204);
    }
}
