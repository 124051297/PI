<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class EmpleadoController extends Controller
{
    public function index()
    {
        $empleados = Empleado::all()->map(function ($empleado) {
            $usuario = Usuario::where('id_empleado', $empleado->id_empleado)->first();
            $data = $empleado->toArray();
            $data['nombre_usuario'] = $usuario?->nombre_usuario;
            $data['id_usuario'] = $usuario?->id_usuario;
            return $data;
        });

        return response()->json($empleados);
    }

    public function store(Request $request)
    {
        $rolMap = ['administrador' => 1, 'encargado' => 2, 'empleado' => 3];

        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'email' => 'required|email|max:150|unique:empleados,correo',
            'telefono' => 'nullable|string|max:20|unique:empleados,telefono',
            'rol' => ['required', Rule::in(array_keys($rolMap))],
            'id_area' => 'required|exists:areas,id_area',
            'nombre_usuario' => 'nullable|string|max:50|unique:usuarios,nombre_usuario',
            'password' => 'nullable|string|min:6|required_with:nombre_usuario',
        ]);

        return DB::transaction(function () use ($validated, $rolMap) {
            [$apellidoPaterno, $apellidoMaterno] = $this->splitLastNames($validated['nombre']);

            $empleado = Empleado::create([
                'nombre' => $validated['nombre'],
                'ap' => $apellidoPaterno,
                'am' => $apellidoMaterno,
                'correo' => $validated['email'],
                'telefono' => $validated['telefono'] ?? null,
                'id_rol' => $rolMap[$validated['rol']],
                'id_area' => $validated['id_area'],
            ]);

            $usuario = null;
            if (!empty($validated['nombre_usuario']) && !empty($validated['password'])) {
                $usuario = Usuario::create([
                    'nombre_usuario' => $validated['nombre_usuario'],
                    'password' => Hash::make($validated['password']),
                    'id_empleado' => $empleado->id_empleado,
                    'ultima_modificacion' => now(),
                ]);
            }

            $result = $empleado->toArray();
            $result['nombre_usuario'] = $usuario?->nombre_usuario;
            $result['id_usuario'] = $usuario?->id_usuario;

            return response()->json($result, 201);
        });
    }

    public function show($id)
    {
        $empleado = Empleado::findOrFail($id);
        $usuario = Usuario::where('id_empleado', $empleado->id_empleado)->first();
        $data = $empleado->toArray();
        $data['nombre_usuario'] = $usuario?->nombre_usuario;
        $data['id_usuario'] = $usuario?->id_usuario;
        return response()->json($data);
    }

    public function update(Request $request, $id)
    {
        $empleado = Empleado::findOrFail($id);
        $usuario = Usuario::where('id_empleado', $empleado->id_empleado)->first();
        $rolMap = ['administrador' => 1, 'encargado' => 2, 'empleado' => 3];

        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'email' => [
                'required',
                'email',
                'max:150',
                Rule::unique('empleados', 'correo')->ignore($empleado->id_empleado, 'id_empleado'),
            ],
            'telefono' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('empleados', 'telefono')->ignore($empleado->id_empleado, 'id_empleado'),
            ],
            'rol' => ['required', Rule::in(array_keys($rolMap))],
            'id_area' => 'required|exists:areas,id_area',
            'nombre_usuario' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('usuarios', 'nombre_usuario')->ignore($usuario?->id_usuario, 'id_usuario'),
            ],
            'password' => 'nullable|string|min:6',
        ]);

        return DB::transaction(function () use ($empleado, $usuario, $validated, $rolMap) {
            [$apellidoPaterno, $apellidoMaterno] = $this->splitLastNames($validated['nombre']);

            $empleado->update([
                'nombre' => $validated['nombre'],
                'ap' => $apellidoPaterno,
                'am' => $apellidoMaterno,
                'correo' => $validated['email'],
                'telefono' => $validated['telefono'] ?? null,
                'id_rol' => $rolMap[$validated['rol']],
                'id_area' => $validated['id_area'],
            ]);

            if ($usuario) {
                $usuarioData = ['ultima_modificacion' => now()];

                if (array_key_exists('nombre_usuario', $validated)) {
                    $usuarioData['nombre_usuario'] = $validated['nombre_usuario'];
                }

                if (!empty($validated['password'])) {
                    $usuarioData['password'] = Hash::make($validated['password']);
                }

                $usuario->update($usuarioData);
            } elseif (!empty($validated['nombre_usuario']) && !empty($validated['password'])) {
                $usuario = Usuario::create([
                    'nombre_usuario' => $validated['nombre_usuario'],
                    'password' => Hash::make($validated['password']),
                    'id_empleado' => $empleado->id_empleado,
                    'ultima_modificacion' => now(),
                ]);
            }

            $result = $empleado->fresh()->toArray();
            $result['nombre_usuario'] = $usuario ? $usuario->fresh()->nombre_usuario : null;
            $result['id_usuario'] = $usuario?->id_usuario;

            return response()->json($result);
        });
    }

    public function destroy($id)
    {
        $empleado = Empleado::findOrFail($id);
        $usuario = Usuario::where('id_empleado', $id)->first();

        $tieneEntradas = DB::table('entradas')->where('id_empleado', $id)->exists();
        $tieneSalidas = DB::table('salidas')->where('id_empleado', $id)->exists();

        if ($tieneEntradas || $tieneSalidas) {
            throw ValidationException::withMessages([
                'empleado' => ['No se puede eliminar el empleado porque tiene movimientos registrados en el sistema.'],
            ]);
        }

        return DB::transaction(function () use ($empleado, $usuario) {
            if ($usuario) {
                DB::table('bitacora')->where('id_usuario', $usuario->id_usuario)->update(['id_usuario' => null]);
                $usuario->delete();
            }

            $empleado->delete();
            return response()->json(null, 204);
        });
    }

    private function splitLastNames(string $fullName): array
    {
        $parts = preg_split('/\s+/', trim($fullName)) ?: [];

        if (count($parts) >= 3) {
            return [$parts[count($parts) - 2], $parts[count($parts) - 1]];
        }

        if (count($parts) === 2) {
            return [$parts[1], null];
        }

        return ['N/A', null];
    }
}
