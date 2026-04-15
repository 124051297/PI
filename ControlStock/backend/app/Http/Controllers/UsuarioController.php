<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Support\SystemLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UsuarioController extends Controller
{
    public function index()
    {
        return response()->json(Usuario::with('empleado')->get());
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

        SystemLogger::log(
            'Crear usuario',
            'Usuario',
            'Se creó el usuario "' . $item->nombre_usuario . '".'
        );

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
            'nombre_usuario' => 'sometimes|string|max:50|unique:usuarios,nombre_usuario,' . $id . ',id_usuario',
            'password' => 'sometimes|nullable|string|min:6',
            'id_empleado' => 'sometimes|exists:empleados,id_empleado',
            'foto_perfil' => 'sometimes|nullable|string',
        ]);

        $updateData = [];
        if (isset($validated['nombre_usuario'])) {
            $updateData['nombre_usuario'] = $validated['nombre_usuario'];
        }
        if (isset($validated['id_empleado'])) {
            $updateData['id_empleado'] = $validated['id_empleado'];
        }
        if (array_key_exists('foto_perfil', $validated)) {
            $updateData['foto_perfil'] = $validated['foto_perfil'];
        }
        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }
        $updateData['ultima_modificacion'] = now();

        $item->update($updateData);

        $empleado = \App\Models\Empleado::find($item->id_empleado);
        if ($empleado) {
            $empleadoData = [];
            if (isset($request->nombre)) {
                $empleadoData['nombre'] = $request->nombre;
            }
            if (isset($request->email)) {
                $empleadoData['correo'] = $request->email;
            }
            if (isset($request->telefono)) {
                $empleadoData['telefono'] = $request->telefono;
            }
            if (!empty($empleadoData)) {
                $empleado->update($empleadoData);
            }
        }

        SystemLogger::log(
            !empty($validated['password']) ? 'Actualizar usuario y contraseña' : 'Actualizar usuario',
            'Usuario',
            'Se actualizó el usuario "' . $item->nombre_usuario . '".'
        );

        return response()->json($this->buildUserPayload($item->fresh(), $empleado));
    }

    public function updatePhoto(Request $request, $id)
    {
        $user = Usuario::findOrFail($id);

        $request->validate([
            'foto_perfil' => 'required|image|max:4096',
        ]);

        $previousPath = $user->getRawOriginal('foto_perfil');
        $storedPath = $request->file('foto_perfil')->store('perfiles', 'public');

        $user->update([
            'foto_perfil' => $storedPath,
            'ultima_modificacion' => now(),
        ]);

        $this->deleteStoredAsset($previousPath);

        SystemLogger::log(
            'Actualizar foto de perfil',
            'Usuario',
            'Se actualizó la foto de perfil del usuario "' . $user->nombre_usuario . '".'
        );

        return response()->json([
            'message' => 'Foto de perfil actualizada correctamente.',
            'foto_perfil' => $user->foto_perfil,
        ]);
    }

    public function destroy($id)
    {
        $usuario = Usuario::findOrFail($id);
        $nombreUsuario = $usuario->nombre_usuario;
        $usuario->delete();

        SystemLogger::log(
            'Eliminar usuario',
            'Usuario',
            'Se eliminó el usuario "' . $nombreUsuario . '".'
        );

        return response()->json(null, 204);
    }

    private function buildUserPayload(Usuario $item, $empleado): array
    {
        $userData = $item->toArray();

        if ($empleado) {
            $userData['nombre'] = $empleado->nombre;
            $userData['email'] = $empleado->correo;
            $userData['telefono'] = $empleado->telefono;
            $userData['empleado'] = $empleado;

            $roleObj = DB::table('roles')->where('id_rol', $empleado->id_rol)->first();
            if ($roleObj) {
                $userData['rol'] = strtolower($roleObj->nombre);
            }
        } else {
            $userData['rol'] = 'empleado';
        }

        return $userData;
    }

    private function deleteStoredAsset(?string $path): void
    {
        if (!$path || Str::startsWith($path, ['http://', 'https://', 'data:'])) {
            return;
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
