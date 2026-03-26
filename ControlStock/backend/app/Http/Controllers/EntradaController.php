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
        return \Illuminate\Support\Facades\DB::transaction(function () use ($request) {
            // 1. Crear la entrada principal
            $entrada = Entrada::create([
                'id_usuario' => $request->id_usuario ?? 1,
                'fecha' => $request->fecha ?? now()
            ]);

            // 2. Crear el detalle
            $detalle = \App\Models\DetalleEntrada::create([
                'id_entrada' => $entrada->id_entrada,
                'id_producto' => $request->id_producto,
                'cantidad' => $request->cantidad
            ]);

            // 3. Actualizar o crear registro en inventarios
            $inventario = \App\Models\Inventario::where('id_producto', $request->id_producto)->first();
            if ($inventario) {
                $inventario->stock_actual += $request->cantidad;
                $inventario->save();
            } else {
                \App\Models\Inventario::create([
                    'id_producto' => $request->id_producto,
                    'stock_actual' => $request->cantidad
                ]);
            }

            // 4. Registrar en historial
            \App\Models\HistorialMovimiento::create([
                'accion' => 'Crear',
                'entidad' => 'Entrada',
                'detalles' => "Entrada de " . $request->cantidad . " unidades del producto ID: " . $request->id_producto,
                'usuario' => 'Admin', // Simplificado
                'id_usuario' => $request->id_usuario ?? 1
            ]);

            return response()->json($entrada->load('detalles'), 201);
        });
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
