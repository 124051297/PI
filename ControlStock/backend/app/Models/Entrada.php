<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entrada extends Model
{
    use HasFactory;
    protected $table = 'entradas';
    protected $primaryKey = 'id_entrada';
    public $timestamps = false;
    protected $guarded = [];

    protected $appends = ['id', 'productos'];

    public function getIdAttribute()
    {
        return $this->attributes['id_entrada'];
    }

    public function detalles()
    {
        return $this->hasMany(DetalleEntrada::class, 'id_entrada', 'id_entrada');
    }

    public function empleado()
    {
        return $this->belongsTo(Empleado::class, 'id_empleado', 'id_empleado');
    }

    public function area()
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }

    public function getProductosAttribute()
    {
        return $this->detalles()->with('producto')->get();
    }
}
