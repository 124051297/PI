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
        $data = $request->all();
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        $item = Usuario::create($data);
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Usuario::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Usuario::findOrFail($id);
        $data = $request->all();
        if (isset($data['password']) && !empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        $item->update($data);

        $empleado = \App\Models\Empleado::find($item->id_empleado);
        if ($empleado) {
            $empleadoData = [];
            if (isset($data['nombre'])) $empleadoData['nombre'] = $data['nombre'];
            if (isset($data['email'])) $empleadoData['correo'] = $data['email'];
            if (isset($data['telefono'])) $empleadoData['telefono'] = $data['telefono'];
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
