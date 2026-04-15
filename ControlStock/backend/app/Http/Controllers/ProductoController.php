<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use App\Models\Producto;
use App\Models\Ubicacion;
use App\Support\SystemLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
            'stock' => 'nullable|integer|min:0',
            'id_categoria' => 'nullable|exists:categorias,id_categoria',
            'id_area' => 'nullable|exists:areas,id_area',
            'area' => 'nullable|string|max:100',
            'id_ubicacion' => 'nullable|exists:ubicaciones,id_ubicacion',
            'codigo' => 'nullable|string|max:100|unique:productos,codigo',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $producto = Producto::create([
                'nombre_producto' => $validated['nombre'],
                'precio_unitario' => $validated['precio'],
                'stock_minimo' => $validated['stockMinimo'],
                'id_categoria' => $validated['id_categoria'] ?? 1,
                'codigo' => $validated['codigo'] ?? null,
            ]);

            $stockInicial = (int) ($validated['stock'] ?? 0);
            if ($stockInicial > 0) {
                $idUbicacion = $this->resolveUbicacionId($request);

                if (!$idUbicacion) {
                    throw ValidationException::withMessages([
                        'stock' => ['No existe una ubicación disponible para registrar el stock inicial.'],
                    ]);
                }

                Inventario::create([
                    'id_producto' => $producto->id_producto,
                    'id_ubicacion' => $idUbicacion,
                    'stock_actual' => $stockInicial,
                ]);
            }

            SystemLogger::log(
                'Crear producto',
                'Producto',
                'Se creó el producto "' . $producto->nombre_producto . '" con stock inicial de ' . $stockInicial . ' unidades.'
            );

            return response()->json([
                'message' => 'Producto creado exitosamente',
                'data' => Producto::find($producto->id_producto),
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
        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:250',
            'precio' => 'sometimes|numeric|min:0',
            'stockMinimo' => 'sometimes|integer|min:0',
            'stock' => 'sometimes|integer|min:0',
            'id_categoria' => 'sometimes|exists:categorias,id_categoria',
            'id_area' => 'nullable|exists:areas,id_area',
            'area' => 'nullable|string|max:100',
            'id_ubicacion' => 'nullable|exists:ubicaciones,id_ubicacion',
            'codigo' => 'nullable|string|max:100|unique:productos,codigo,' . $id . ',id_producto',
        ]);

        return DB::transaction(function () use ($request, $validated, $id) {
            $producto = Producto::findOrFail($id);

            $producto->nombre_producto = $validated['nombre'] ?? $producto->nombre_producto;
            $producto->precio_unitario = $validated['precio'] ?? $producto->precio_unitario;
            $producto->stock_minimo = $validated['stockMinimo'] ?? $producto->stock_minimo;

            if (array_key_exists('id_categoria', $validated)) {
                $producto->id_categoria = $validated['id_categoria'];
            }
            if (array_key_exists('codigo', $validated)) {
                $producto->codigo = $validated['codigo'];
            }

            $producto->save();

            if (array_key_exists('stock', $validated)) {
                $this->syncInventoryStock(
                    $producto,
                    (int) $validated['stock'],
                    $this->resolveUbicacionId($request, $producto)
                );
            }

            SystemLogger::log(
                'Actualizar producto',
                'Producto',
                'Se actualizó el producto "' . $producto->nombre_producto . '".'
            );

            return response()->json([
                'message' => 'Producto actualizado exitosamente',
                'data' => Producto::find($producto->id_producto),
            ]);
        });
    }

    public function destroy($id)
    {
        $producto = Producto::findOrFail($id);

        return DB::transaction(function () use ($producto, $id) {
            $nombreProducto = $producto->nombre_producto;
            \App\Models\DetalleEntrada::where('id_producto', $id)->delete();
            \App\Models\DetalleSalida::where('id_producto', $id)->delete();
            Inventario::where('id_producto', $id)->delete();
            $producto->delete();

            SystemLogger::log(
                'Eliminar producto',
                'Producto',
                'Se eliminó el producto "' . $nombreProducto . '".'
            );

            return response()->json(null, 204);
        });
    }

    private function resolveUbicacionId(Request $request, ?Producto $producto = null): ?int
    {
        if ($request->filled('id_ubicacion')) {
            return (int) $request->input('id_ubicacion');
        }

        if ($request->filled('id_area')) {
            return Ubicacion::where('id_area', $request->input('id_area'))->value('id_ubicacion');
        }

        if ($request->filled('area')) {
            $ubicacion = Ubicacion::whereHas('area', function ($query) use ($request) {
                $query->where('nombre', $request->input('area'));
            })->first();

            if ($ubicacion) {
                return $ubicacion->id_ubicacion;
            }
        }

        if ($producto) {
            $inventario = Inventario::where('id_producto', $producto->id_producto)
                ->orderByDesc('stock_actual')
                ->first();

            if ($inventario) {
                return $inventario->id_ubicacion;
            }
        }

        return Ubicacion::value('id_ubicacion');
    }

    private function syncInventoryStock(Producto $producto, int $desiredStock, ?int $preferredUbicacionId): void
    {
        $inventarios = Inventario::where('id_producto', $producto->id_producto)->get();
        $currentStock = (int) $inventarios->sum('stock_actual');
        

        if ($currentStock === $desiredStock) {
            return;
        }

        if ($currentStock < $desiredStock) {
            if (!$preferredUbicacionId) {
                throw ValidationException::withMessages([
                    'stock' => ['No existe una ubicación disponible para ajustar el stock del producto.'],
                ]);
            }

            $inventario = Inventario::firstOrCreate(
                ['id_producto' => $producto->id_producto, 'id_ubicacion' => $preferredUbicacionId],
                ['stock_actual' => 0]
            );

            $inventario->stock_actual += ($desiredStock - $currentStock);
            $inventario->save();
            return;
        }

        $remainingReduction = $currentStock - $desiredStock;
        $orderedInventarios = $inventarios
            ->sortByDesc(function ($inventario) use ($preferredUbicacionId) {
                return ($inventario->id_ubicacion === $preferredUbicacionId ? 1000000 : 0) + $inventario->stock_actual;
            })
            ->values();

        foreach ($orderedInventarios as $inventario) {
            if ($remainingReduction <= 0) {
                break;
            }

            $reduction = min($inventario->stock_actual, $remainingReduction);
            $inventario->stock_actual -= $reduction;
            $inventario->save();
            $remainingReduction -= $reduction;
        }

        if ($remainingReduction > 0) {
            throw ValidationException::withMessages([
                'stock' => ['No fue posible ajustar el stock del producto con la información disponible.'],
            ]);
        }
    }

    public function validarStockUbicacion(Request $request)
    {
        // Esto permite a la app móvil validar si hay stock inmediatamente cuando el usuario
        // escanea un rack distinto al sugerido en una salida.
        $validated = $request->validate([
            'id_producto' => 'required|exists:productos,id_producto',
            'codigo_ubicacion' => 'required|string',
        ]);

        $ubicacion = Ubicacion::where('codigo_ubicacion', $validated['codigo_ubicacion'])
                   ->orWhere('id_ubicacion', $validated['codigo_ubicacion'])
                   ->first();

        if (!$ubicacion) {
            return response()->json([
                'valido' => false,
                'stock_actual' => 0,
                'mensaje' => 'La ubicación escaneada no existe en el sistema.'
            ], 404);
        }

        $inventario = Inventario::where('id_producto', $validated['id_producto'])
            ->where('id_ubicacion', $ubicacion->id_ubicacion)
            ->first();

        if (!$inventario || $inventario->stock_actual <= 0) {
            // Buscar sugerencias: Donde si hay stock
            $sugerencias = Inventario::where('id_producto', $validated['id_producto'])
                ->where('id_ubicacion', '!=', $ubicacion->id_ubicacion)
                ->where('stock_actual', '>', 0)
                ->with(['ubicacion.area'])
                ->get()
                ->map(function($i) {
                    return [
                        'area' => optional($i->ubicacion->area)->nombre ?? 'N/A',
                        'ubicacion' => $i->ubicacion->codigo_ubicacion,
                        'stock' => $i->stock_actual
                    ];
                });

            return response()->json([
                'valido' => false,
                'stock_actual' => 0,
                'id_ubicacion_validada' => $ubicacion->id_ubicacion,
                'sugerencias' => $sugerencias,
                'mensaje' => 'No hay existencias de este producto en la ubicación escaneada.'
            ], 200);
        }

        return response()->json([
            'valido' => true,
            'stock_actual' => $inventario->stock_actual,
            'id_ubicacion_validada' => $ubicacion->id_ubicacion,
            'mensaje' => 'Stock disponible.'
        ], 200);
    }
}
