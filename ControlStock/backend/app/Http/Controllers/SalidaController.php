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
        return \Illuminate\Support\Facades\DB::transaction(function () use ($request) {
            // 1. Verificar stock actual
            $inventario = \App\Models\Inventario::where('id_producto', $request->id_producto)->first();
            if (!$inventario || $inventario->stock_actual < $request->cantidad) {
                return response()->json(['message' => 'Stock insuficiente'], 400);
            }

            // 2. Crear la salida
            $salida = Salida::create([
                'id_usuario' => $request->id_usuario ?? 1,
                'fecha' => $request->fecha ?? now()
            ]);

            // 3. Crear el detalle
            \App\Models\DetalleSalida::create([
                'id_salida' => $salida->id_salida,
                'id_producto' => $request->id_producto,
                'cantidad' => $request->cantidad
            ]);

            // 4. Actualizar inventario
            $inventario->stock_actual -= $request->cantidad;
            $inventario->save();

            // 5. Registrar en historial
            \App\Models\HistorialMovimiento::create([
                'accion' => 'Eliminar',
                'entidad' => 'Salida',
                'detalles' => "Salida de " . $request->cantidad . " unidades del producto ID: " . $request->id_producto,
                'usuario' => 'Admin', // Simplificado
                'id_usuario' => $request->id_usuario ?? 1
            ]);

            return response()->json($salida->load('detalles'), 201);
        });
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
