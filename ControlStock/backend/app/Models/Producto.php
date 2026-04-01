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

    protected $appends = ['id', 'nombre', 'precio', 'stockMinimo', 'stock', 'categoria', 'codigo', 'area', 'ubicacion', 'ubicaciones_detalle'];

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
        return \App\Models\Inventario::where('id_producto', $this->id_producto)->sum('stock_actual');
    }

    public function getCategoriaAttribute()
    {
        $categoria = \App\Models\Categoria::find($this->id_categoria);
        return $categoria ? $categoria->nombre : 'Sin Categoría';
    }

    /**
     * Devuelve el nombre del área principal del producto
     * (basado en la primera ubicación del inventario).
     */
    public function getAreaAttribute()
    {
        $inventario = \App\Models\Inventario::where('id_producto', $this->id_producto)->first();
        if ($inventario) {
            $ubicacion = \App\Models\Ubicacion::find($inventario->id_ubicacion);
            if ($ubicacion) {
                $area = \App\Models\Area::find($ubicacion->id_area);
                return $area ? $area->nombre : 'Sin Área';
            }
        }
        return 'Sin Área';
    }

    /**
     * Devuelve el código de la ubicación principal del producto.
     */
    public function getUbicacionAttribute()
    {
        $inventario = \App\Models\Inventario::where('id_producto', $this->id_producto)->first();
        if ($inventario) {
            $ubicacion = \App\Models\Ubicacion::find($inventario->id_ubicacion);
            return $ubicacion ? $ubicacion->codigo_ubicacion : 'Sin Ubicación';
        }
        return 'Sin Ubicación';
    }

    public function getCodigoAttribute()
    {
        if (!empty($this->attributes['codigo'])) {
            return $this->attributes['codigo'];
        }
        return 'PROD-' . str_pad($this->id_producto, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Devuelve todas las ubicaciones donde se encuentra el producto
     * con su área, pasillo, estante, nivel y stock en cada ubicación.
     */
    public function getUbicacionesDetalleAttribute()
    {
        $inventarios = \App\Models\Inventario::where('id_producto', $this->id_producto)->get();

        $ubicaciones = [];
        foreach ($inventarios as $inv) {
            $ubicacion = \App\Models\Ubicacion::find($inv->id_ubicacion);
            if ($ubicacion) {
                $area = \App\Models\Area::find($ubicacion->id_area);
                $ubicaciones[] = [
                    'id_ubicacion' => $ubicacion->id_ubicacion,
                    'area' => $area ? $area->nombre : 'Sin Área',
                    'id_area' => $ubicacion->id_area,
                    'pasillo' => $ubicacion->pasillo,
                    'estante' => $ubicacion->estante,
                    'nivel' => $ubicacion->nivel,
                    'codigo_ubicacion' => $ubicacion->codigo_ubicacion,
                    'stock_en_ubicacion' => $inv->stock_actual,
                ];
            }
        }
        return $ubicaciones;
    }
}
