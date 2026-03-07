<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    use HasFactory;
    protected $table = 'productos';
    protected $primaryKey = 'id_producto';
    public $timestamps = false;
    protected $guarded = [];

    protected static function booted()
    {
        static::created(function ($producto) {
            $user = \Illuminate\Support\Facades\Auth::user();
            \App\Models\HistorialMovimiento::create([
                'usuario' => $user ? ($user->nombre ?? $user->usuario ?? 'Desconocido') : 'Sistema',
                'accion' => 'Crear',
                'entidad' => 'Producto',
                'entidad_id' => $producto->id_producto,
                'detalles' => 'Producto agregado: ' . ($producto->nombre_producto ?? 'N/A')
            ]);
        });

        static::updated(function ($producto) {
            $user = \Illuminate\Support\Facades\Auth::user();
            \App\Models\HistorialMovimiento::create([
                'usuario' => $user ? ($user->nombre ?? $user->usuario ?? 'Desconocido') : 'Sistema',
                'accion' => 'Modificar',
                'entidad' => 'Producto',
                'entidad_id' => $producto->id_producto,
                'detalles' => 'Producto modificado: ' . ($producto->nombre_producto ?? 'N/A')
            ]);
        });

        static::deleted(function ($producto) {
            $user = \Illuminate\Support\Facades\Auth::user();
            \App\Models\HistorialMovimiento::create([
                'usuario' => $user ? ($user->nombre ?? $user->usuario ?? 'Desconocido') : 'Sistema',
                'accion' => 'Eliminar',
                'entidad' => 'Producto',
                'entidad_id' => $producto->id_producto,
                'detalles' => 'Producto eliminado: ' . ($producto->nombre_producto ?? 'N/A')
            ]);
        });
    }
}
