<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required',
            'password' => 'required',
        ]);

        $user = Usuario::where('nombre_usuario', $request->email)->first();

        // Check if user exists and password matches (plain-text or hashed)
        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        $passwordMatch = false;
        if ($request->password === $user->password) {
            $passwordMatch = true;
        } elseif (Str::startsWith($user->password, ['$2y$', '$2a$'])) {
            if (Hash::check($request->password, $user->password)) {
                $passwordMatch = true;
            }
        }

        if (!$passwordMatch) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        // Retrieve role for frontend logic
        $roleName = 'empleado';
        $empleado = DB::table('empleados')->where('id_empleado', $user->id_empleado)->first();
        if ($empleado) {
            $roleObj = DB::table('roles')->where('id_rol', $empleado->id_rol)->first();
            if ($roleObj) {
                $roleName = strtolower($roleObj->nombre);
            }
        }

        $userData = $user->toArray();
        $userData['rol'] = $roleName;
        
        if ($empleado) {
            $userData['nombre'] = $empleado->nombre;
            $userData['ap'] = $empleado->ap;
            $userData['am'] = $empleado->am;
            $userData['email'] = $empleado->correo;
            $userData['telefono'] = $empleado->telefono;
        }

        return response()->json([
            'user' => $userData,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Cierre de sesión exitoso'
        ]);
    }
}
