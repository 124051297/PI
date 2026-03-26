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
        $data = [
            'nombre_producto' => $request->nombre,
            'precio_unitario' => $request->precio,
            'stock_minimo' => $request->stockMinimo,
            'id_categoria' => $request->id_categoria ?? 1
        ];
        $item = Producto::create($data);
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Producto::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Producto::findOrFail($id);
        $data = [
            'nombre_producto' => $request->nombre ?? $item->nombre_producto,
            'precio_unitario' => $request->precio ?? $item->precio_unitario,
            'stock_minimo' => $request->stockMinimo ?? $item->stock_minimo,
            'id_categoria' => $request->id_categoria ?? $item->id_categoria
        ];
        $item->update($data);
        return response()->json($item);
    }

    public function destroy($id)
    {
        Producto::destroy($id);
        return response()->json(null, 204);
    }
}
