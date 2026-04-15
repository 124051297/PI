<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use App\Models\Producto;
use App\Models\Usuario;
use App\Support\SystemLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class NotificacionesController extends Controller
{
    public function index(Request $request)
    {
        $this->generarAlertasStockBajo();

        $query = Notificacion::with('usuario.empleado')->orderByDesc('fecha');

        if (!$this->isAdmin($request)) {
            $query->where(function ($builder) use ($request) {
                $builder->whereNull('id_usuario')
                    ->orWhere('id_usuario', $request->user()?->id_usuario);
            });
        }

        return response()->json(
            $query->get()->map(function (Notificacion $notificacion) {
                return [
                    'id' => $notificacion->id,
                    'titulo' => $notificacion->titulo,
                    'mensaje' => $notificacion->mensaje,
                    'tipo' => $notificacion->tipo,
                    'leida' => (bool) $notificacion->leida,
                    'fecha' => optional($notificacion->fecha)->format('Y-m-d H:i:s') ?? (string) $notificacion->fecha,
                    'id_usuario' => $notificacion->id_usuario,
                    'destinatario' => $notificacion->usuario
                        ? trim(($notificacion->usuario->empleado?->nombre ?? '') . ' ' . ($notificacion->usuario->empleado?->ap ?? ''))
                        : 'General',
                ];
            })
        );
    }

    public function store(Request $request)
    {
        if (!$this->isAdmin($request)) {
            throw ValidationException::withMessages([
                'rol' => ['Solo los administradores pueden crear notificaciones.'],
            ]);
        }

        $validated = $request->validate([
            'titulo' => 'required|string|max:150',
            'mensaje' => 'required|string|max:1000',
            'tipo' => ['required', Rule::in(['info', 'success', 'warning', 'error'])],
            'id_usuarios' => 'nullable|array',
            'id_usuarios.*' => 'exists:usuarios,id_usuario',
            'para_todos' => 'nullable|boolean',
        ]);

        $destinatarios = collect($validated['id_usuarios'] ?? [])->filter()->unique()->values();
        $paraTodos = (bool) ($validated['para_todos'] ?? false);

        if (!$paraTodos && $destinatarios->isEmpty()) {
            throw ValidationException::withMessages([
                'id_usuarios' => ['Selecciona al menos un destinatario o marca la opción para todos.'],
            ]);
        }

        $creadas = DB::transaction(function () use ($validated, $destinatarios, $paraTodos) {
            if ($paraTodos) {
                return collect([
                    Notificacion::create([
                        'titulo' => $validated['titulo'],
                        'mensaje' => $validated['mensaje'],
                        'tipo' => $validated['tipo'],
                        'leida' => false,
                        'fecha' => now(),
                        'id_usuario' => null,
                    ]),
                ]);
            }

            return $destinatarios->map(function ($idUsuario) use ($validated) {
                return Notificacion::create([
                    'titulo' => $validated['titulo'],
                    'mensaje' => $validated['mensaje'],
                    'tipo' => $validated['tipo'],
                    'leida' => false,
                    'fecha' => now(),
                    'id_usuario' => $idUsuario,
                ]);
            });
        });

        SystemLogger::log(
            'Crear notificación',
            'Notificación',
            $paraTodos
                ? 'Se envió la notificación "' . $validated['titulo'] . '" a todos los empleados.'
                : 'Se envió la notificación "' . $validated['titulo'] . '" a ' . $creadas->count() . ' destinatario(s).'
        );

        return response()->json([
            'message' => 'Notificación creada correctamente.',
            'data' => $creadas,
        ], 201);
    }

    private function generarAlertasStockBajo()
    {
        $productosBajoStock = Producto::leftJoin('inventarios', 'productos.id_producto', '=', 'inventarios.id_producto')
            ->where(function ($query) {
                $query->whereColumn('inventarios.stock_actual', '<', 'productos.stock_minimo')
                    ->orWhereNull('inventarios.stock_actual');
            })
            ->select('productos.*', 'inventarios.stock_actual')
            ->get();

        foreach ($productosBajoStock as $producto) {
            $mensaje = 'El producto "' . $producto->nombre_producto . '" tiene solo ' . ($producto->stock_actual ?? 0) . ' unidades (Mínimo: ' . $producto->stock_minimo . ')';

            $existe = Notificacion::where('titulo', 'Alerta de Stock Bajo')
                ->where('mensaje', $mensaje)
                ->exists();

            if (!$existe) {
                Notificacion::create([
                    'titulo' => 'Alerta de Stock Bajo',
                    'mensaje' => $mensaje,
                    'tipo' => 'warning',
                    'leida' => false,
                    'fecha' => now(),
                ]);
            }
        }
    }

    public function update(Request $request, $id)
    {
        $notificacion = Notificacion::findOrFail($id);
        $this->authorizeNotificationAccess($request, $notificacion);
        $notificacion->update([
            'leida' => $request->boolean('leida', true),
        ]);
        return response()->json($notificacion);
    }

    public function destroy(Request $request, $id)
    {
        $notificacion = Notificacion::findOrFail($id);
        $this->authorizeNotificationAccess($request, $notificacion);
        $notificacion->delete();
        return response()->json(null, 204);
    }

    public function markAllAsRead(Request $request)
    {
        $query = Notificacion::where('leida', false);

        if (!$this->isAdmin($request)) {
            $query->where(function ($builder) use ($request) {
                $builder->whereNull('id_usuario')
                    ->orWhere('id_usuario', $request->user()?->id_usuario);
            });
        }

        $query->update(['leida' => true]);
        return response()->json(['message' => 'Todas marcadas como leídas']);
    }

    public function unreadCount(Request $request)
    {
        $query = Notificacion::where('leida', false);

        if (!$this->isAdmin($request)) {
            $query->where(function ($builder) use ($request) {
                $builder->whereNull('id_usuario')
                    ->orWhere('id_usuario', $request->user()?->id_usuario);
            });
        }

        return response()->json([
            'count' => $query->count(),
        ]);
    }

    private function authorizeNotificationAccess(Request $request, Notificacion $notificacion): void
    {
        if ($this->isAdmin($request)) {
            return;
        }

        if ($notificacion->id_usuario !== null && $notificacion->id_usuario !== $request->user()?->id_usuario) {
            abort(403, 'No tienes permisos para modificar esta notificación.');
        }
    }

    private function isAdmin(Request $request): bool
    {
        $usuario = $request->user();
        if (!$usuario) {
            return false;
        }

        $rol = DB::table('empleados')
            ->join('roles', 'roles.id_rol', '=', 'empleados.id_rol')
            ->where('empleados.id_empleado', $usuario->id_empleado)
            ->value('roles.nombre');

        return strtolower((string) $rol) === 'administrador';
    }
}
