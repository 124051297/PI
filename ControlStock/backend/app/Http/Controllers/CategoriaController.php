<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index()
    {
        return response()->json(Categoria::all());
    }

    public function store(Request $request)
    {
        $item = Categoria::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Categoria::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Categoria::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Categoria::destroy($id);
        return response()->json(null, 204);
    }
}
