<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class EmpleadoController extends Controller
{
    public function index()
    {
        // Cargar empleados con su usuario vinculado para exponer nombre_usuario
        $empleados = Empleado::all()->map(function ($emp) {
            $usuario = Usuario::where('id_empleado', $emp->id_empleado)->first();
            $data = $emp->toArray();
            $data['nombre_usuario'] = $usuario ? $usuario->nombre_usuario : null;
            $data['id_usuario'] = $usuario ? $usuario->id_usuario : null;
            return $data;
        });

        return response()->json($empleados);
    }

    public function store(Request $request)
    {
        $rolMap = ['administrador' => 1, 'encargado' => 2, 'empleado' => 3];

        $data = [
            'nombre' => $request->nombre,
            'correo' => $request->email ?? $request->correo,
            'telefono' => $request->telefono,
            'id_rol' => $rolMap[$request->rol] ?? 3,
            'id_area' => $request->id_area ?? 1
        ];

        $item = Empleado::create($data);

        // Si se proporciona nombre_usuario y password, crear usuario vinculado
        if ($request->filled('nombre_usuario') && $request->filled('password')) {
            $usuario = Usuario::create([
                'nombre_usuario' => $request->nombre_usuario,
                'password' => Hash::make($request->password),
                'id_empleado' => $item->id_empleado,
                'ultima_modificacion' => now()
            ]);
            $result = $item->toArray();
            $result['nombre_usuario'] = $usuario->nombre_usuario;
            $result['id_usuario'] = $usuario->id_usuario;
            return response()->json($result, 201);
        }

        return response()->json($item, 201);
    }

    public function show($id)
    {
        $emp = Empleado::findOrFail($id);
        $usuario = Usuario::where('id_empleado', $emp->id_empleado)->first();
        $data = $emp->toArray();
        $data['nombre_usuario'] = $usuario ? $usuario->nombre_usuario : null;
        $data['id_usuario'] = $usuario ? $usuario->id_usuario : null;
        return response()->json($data);
    }

    public function update(Request $request, $id)
    {
        $item = Empleado::findOrFail($id);
        $rolMap = ['administrador' => 1, 'encargado' => 2, 'empleado' => 3];

        // Actualizar datos del empleado
        $empData = [
            'nombre'   => $request->nombre   ?? $item->nombre,
            'correo'   => $request->email    ?? $request->correo ?? $item->correo,
            'telefono' => $request->telefono ?? $item->telefono,
            'id_rol'   => isset($request->rol) ? ($rolMap[$request->rol] ?? $item->id_rol) : $item->id_rol,
            'id_area'  => $request->id_area  ?? $item->id_area
        ];
        $item->update($empData);

        // Actualizar el Usuario vinculado si existe
        $usuario = Usuario::where('id_empleado', $item->id_empleado)->first();
        if ($usuario) {
            $usuarioData = ['ultima_modificacion' => now()];

            if ($request->filled('nombre_usuario')) {
                $usuarioData['nombre_usuario'] = $request->nombre_usuario;
            }
            if ($request->filled('password')) {
                $usuarioData['password'] = Hash::make($request->password);
            }
            $usuario->update($usuarioData);
        }

        $result = $item->fresh()->toArray();
        $result['nombre_usuario'] = $usuario ? $usuario->fresh()->nombre_usuario : null;
        $result['id_usuario'] = $usuario ? $usuario->id_usuario : null;

        return response()->json($result);
    }

    public function destroy($id)
    {
        $empleado = Empleado::findOrFail($id);

        // Eliminar primero el usuario vinculado (FK constraint)
        Usuario::where('id_empleado', $id)->delete();

        $empleado->delete();
        return response()->json(null, 204);
    }
}
