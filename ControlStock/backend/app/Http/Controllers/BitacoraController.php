<?php

namespace App\Http\Controllers;

use App\Models\Bitacora;
use Illuminate\Http\Request;

class BitacoraController extends Controller
{
    public function index()
    {
        // Se une con 'usuario' y a su vez con 'empleado' para tener el nombre real
        $logs = Bitacora::with('usuario.empleado')->orderByDesc('fecha')->get();
        
        // Formatear para el frontend
        $data = $logs->map(function($log) {
            return [
                'id' => $log->id_log,
                'accion' => $log->accion,
                'entidad' => $log->entidad,
                'detalles' => $log->detalles,
                'usuario' => $log->usuario ? ($log->usuario->empleado ? $log->usuario->empleado->nombre : $log->usuario->nombre_usuario) : 'Sistema',
                'fecha' => $log->fecha,
                'id_usuario' => $log->id_usuario
            ];
        });

        return response()->json($data);
    }
}
