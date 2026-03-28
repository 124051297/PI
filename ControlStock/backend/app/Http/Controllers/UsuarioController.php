<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UsuarioController extends Controller
{
    public function index()
    {
        return response()->json(Usuario::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_usuario' => 'required|string|unique:usuarios,nombre_usuario|max:50',
            'password' => 'required|string|min:6',
            'id_empleado' => 'required|exists:empleados,id_empleado'
        ]);

        $item = Usuario::create([
            'nombre_usuario' => $validated['nombre_usuario'],
            'password' => Hash::make($validated['password']),
            'id_empleado' => $validated['id_empleado'],
            'ultima_modificacion' => now()
        ]);

        return response()->json([
            'message' => 'Usuario creado exitosamente',
            'data' => $item
        ], 201);
    }

    public function show($id)
    {
        $usuario = Usuario::with('empleado')->findOrFail($id);
        return response()->json(['data' => $usuario]);
    }

    public function update(Request $request, $id)
    {
        $item = Usuario::findOrFail($id);
        
        $validated = $request->validate([
            'nombre_usuario' => 'sometimes|string|max:50|unique:usuarios,nombre_usuario,'.$id.',id_usuario',
            'password' => 'sometimes|nullable|string|min:6',
            'id_empleado' => 'sometimes|exists:empleados,id_empleado'
        ]);

        $updateData = [];
        if (isset($validated['nombre_usuario'])) $updateData['nombre_usuario'] = $validated['nombre_usuario'];
        if (isset($validated['id_empleado'])) $updateData['id_empleado'] = $validated['id_empleado'];
        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }
        $updateData['ultima_modificacion'] = now();

        $item->update($updateData);

        $empleado = \App\Models\Empleado::find($item->id_empleado);
        if ($empleado) {
            $empleadoData = [];
            if (isset($request->nombre)) $empleadoData['nombre'] = $request->nombre;
            if (isset($request->email)) $empleadoData['correo'] = $request->email;
            if (isset($request->telefono)) $empleadoData['telefono'] = $request->telefono;
            if (!empty($empleadoData)) $empleado->update($empleadoData);
        }

        $userData = $item->toArray();
        if ($empleado) {
            $userData['nombre'] = $empleado->nombre;
            $userData['email'] = $empleado->correo;
            $userData['telefono'] = $empleado->telefono;
            
            // Re-hidratar el rol (Igual que en AuthController)
            $roleObj = DB::table('roles')->where('id_rol', $empleado->id_rol)->first();
            if ($roleObj) {
                $userData['rol'] = strtolower($roleObj->nombre);
            }
        } else {
            $userData['rol'] = 'empleado'; // Default fallback
        }

        return response()->json($userData);
    }

    public function destroy($id)
    {
        Usuario::destroy($id);
        return response()->json(null, 204);
    }
}
