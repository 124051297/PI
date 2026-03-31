<?php

namespace App\Http\Controllers;

use App\Models\Bitacora;
use Carbon\Carbon;

class BitacoraController extends Controller
{
    public function index()
    {
        $logs = Bitacora::with('usuario.empleado')->orderByDesc('fecha')->get();

        $data = $logs->map(function ($log) {
            return [
                'id' => $log->id_log,
                'accion' => $log->accion,
                'entidad' => $log->entidad ?: 'Sistema',
                'detalles' => $log->detalles,
                'usuario' => $log->usuario ? ($log->usuario->empleado ? $log->usuario->empleado->nombre : $log->usuario->nombre_usuario) : 'Sistema',
                'fecha' => $log->fecha ? Carbon::parse($log->fecha)->format('Y-m-d H:i:s') : null,
                'fecha_legible' => $log->fecha ? Carbon::parse($log->fecha)->translatedFormat('d \\d\\e F \\d\\e Y, H:i:s') : null,
                'id_usuario' => $log->id_usuario
            ];
        });

        return response()->json($data);
    }
}
