<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required',
            'password' => 'required',
        ]);

        $user = Usuario::where('nombre_usuario', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        $passwordMatch = false;
        if ($request->password === $user->password) {
            $passwordMatch = true;
        } elseif (Str::startsWith($user->password, ['$2y$', '$2a$'])) {
            $passwordMatch = Hash::check($request->password, $user->password);
        }

        if (!$passwordMatch) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

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
            'message' => 'Cierre de sesión exitoso',
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();
        $currentPassword = $request->input('current_password');

        $passwordMatch = $currentPassword === $user->password;
        if (!$passwordMatch && Str::startsWith($user->password, ['$2y$', '$2a$'])) {
            $passwordMatch = Hash::check($currentPassword, $user->password);
        }

        if (!$passwordMatch) {
            throw ValidationException::withMessages([
                'current_password' => ['La contraseña actual es incorrecta.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->input('password')),
            'ultima_modificacion' => now(),
        ]);

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.',
        ]);
    }
}
