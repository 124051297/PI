<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    public function index(Request $request)
    {
        // En una implementación real, filtraríamos por id_usuario si no es broadcast
        return response()->json(Notificacion::orderByDesc('fecha')->get());
    }

    public function update(Request $request, $id)
    {
        $notificacion = Notificacion::findOrFail($id);
        $notificacion->update([
            'leida' => $request->leida ?? true
        ]);
        return response()->json($notificacion);
    }

    public function markAllAsRead()
    {
        Notificacion::where('leida', false)->update(['leida' => true]);
        return response()->json(['message' => 'Todas marcadas como leídas']);
    }

    public function destroy($id)
    {
        $notificacion = Notificacion::findOrFail($id);
        $notificacion->delete();
        return response()->json(null, 204);
    }
}
