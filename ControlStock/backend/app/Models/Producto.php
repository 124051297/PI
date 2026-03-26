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

    protected $appends = ['id', 'nombre', 'precio', 'stockMinimo', 'stock', 'area', 'codigo'];

    public function getIdAttribute()
    {
        return $this->attributes['id_producto'];
    }

    public function getNombreAttribute()
    {
        return $this->attributes['nombre_producto'];
    }

    public function getPrecioAttribute()
    {
        return (float) $this->attributes['precio_unitario'];
    }

    public function getStockMinimoAttribute()
    {
        return $this->attributes['stock_minimo'];
    }

    public function getStockAttribute()
    {
        $inv = \App\Models\Inventario::where('id_producto', $this->id_producto)->first();
        return $inv ? $inv->stock_actual : 0;
    }

    public function getAreaAttribute()
    {
        // Simplificado: Buscar el área a través de la categoría o similar
        // Por ahora devolvemos un string genérico o buscamos en la tabla areas
        $categoria = \App\Models\Categoria::find($this->id_categoria);
        return $categoria ? $categoria->nombre : 'Sin Área';
    }

    public function getCodigoAttribute()
    {
        // Como no hay columna codigo, generamos uno basado en el id
        return 'PROD-' . str_pad($this->id_producto, 3, '0', STR_PAD_LEFT);
    }

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
