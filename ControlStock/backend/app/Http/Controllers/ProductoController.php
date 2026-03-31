<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Inventario;
use App\Models\Ubicacion;
use App\Models\Area;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductoController extends Controller
{
    public function index()
    {
        return response()->json(Producto::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre'      => 'required|string|max:250',
            'precio'      => 'required|numeric|min:0',
            'stockMinimo' => 'required|integer|min:0',
            'id_categoria'=> 'nullable|exists:categorias,id_categoria',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $producto = Producto::create([
                'nombre_producto' => $validated['nombre'],
                'precio_unitario' => $validated['precio'],
                'stock_minimo'    => $validated['stockMinimo'],
                'id_categoria'    => $validated['id_categoria'] ?? 1,
            ]);

            // Si se especifica stock inicial, crear registro en inventario usando la primera ubicación disponible
            $stockInicial = (int) ($request->stock ?? 0);
            if ($stockInicial > 0) {
                // Buscar ubicación: primero por id_ubicacion explícito, luego la primera disponible
                $id_ubicacion = $request->id_ubicacion;
                if (!$id_ubicacion) {
                    $primeraUbicacion = Ubicacion::first();
                    $id_ubicacion = $primeraUbicacion ? $primeraUbicacion->id_ubicacion : null;
                }

                if ($id_ubicacion) {
                    Inventario::create([
                        'id_producto'  => $producto->id_producto,
                        'id_ubicacion' => $id_ubicacion,
                        'stock_actual' => $stockInicial,
                    ]);
                }
            }

            // Reload fresh with appended attributes
            $producto = Producto::find($producto->id_producto);

            return response()->json([
                'message' => 'Producto creado exitosamente',
                'data'    => $producto
            ], 201);
        });
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
            'nombre'      => 'sometimes|string|max:250',
            'precio'      => 'sometimes|numeric|min:0',
            'stockMinimo' => 'sometimes|integer|min:0',
            'id_categoria'=> 'sometimes|exists:categorias,id_categoria',
        ]);

        $item->update([
            'nombre_producto' => $validated['nombre']      ?? $item->nombre_producto,
            'precio_unitario' => $validated['precio']      ?? $item->precio_unitario,
            'stock_minimo'    => $validated['stockMinimo'] ?? $item->stock_minimo,
            'id_categoria'    => $validated['id_categoria'] ?? $item->id_categoria,
        ]);

        $item = Producto::find($item->id_producto);

        return response()->json([
            'message' => 'Producto actualizado exitosamente',
            'data'    => $item
        ]);
    }

    public function destroy($id)
    {
        $producto = Producto::findOrFail($id);

        return DB::transaction(function () use ($producto, $id) {
            // 1. Eliminar detalles de entradas y salidas (FK sobre id_producto)
            \App\Models\DetalleEntrada::where('id_producto', $id)->delete();
            \App\Models\DetalleSalida::where('id_producto', $id)->delete();

            // 2. Eliminar registros de inventario
            Inventario::where('id_producto', $id)->delete();

            // 3. Eliminar el producto
            $producto->delete();

            return response()->json(null, 204);
        });
    }
}
