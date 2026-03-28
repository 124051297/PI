<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    public function index()
    {
        return response()->json(Producto::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:250',
            'precio' => 'required|numeric|min:0',
            'stockMinimo' => 'required|integer|min:0',
            'id_categoria' => 'required|exists:categorias,id_categoria'
        ]);

        $item = Producto::create([
            'nombre_producto' => $validated['nombre'],
            'precio_unitario' => $validated['precio'],
            'stock_minimo' => $validated['stockMinimo'],
            'id_categoria' => $validated['id_categoria']
        ]);

        return response()->json([
            'message' => 'Producto creado exitosamente',
            'data' => $item
        ], 201);
    }

    public function show($id)
    {
        $producto = Producto::findOrFail($id);
        return response()->json(['data' => $producto]);
    }

    public function update(Request $request, $id)
    {
        $item = Producto::findOrFail($id);
        
        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:250',
            'precio' => 'sometimes|numeric|min:0',
            'stockMinimo' => 'sometimes|integer|min:0',
            'id_categoria' => 'sometimes|exists:categorias,id_categoria'
        ]);

        $item->update([
            'nombre_producto' => $validated['nombre'] ?? $item->nombre_producto,
            'precio_unitario' => $validated['precio'] ?? $item->precio_unitario,
            'stock_minimo' => $validated['stockMinimo'] ?? $item->stock_minimo,
            'id_categoria' => $validated['id_categoria'] ?? $item->id_categoria
        ]);

        return response()->json([
            'message' => 'Producto actualizado exitosamente',
            'data' => $item
        ]);
    }

    public function destroy($id)
    {
        Producto::destroy($id);
        return response()->json(null, 204);
    }
}
