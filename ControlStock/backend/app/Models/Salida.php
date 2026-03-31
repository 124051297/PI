<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salida extends Model
{
    use HasFactory;
    protected $table = 'salidas';
    protected $primaryKey = 'id_salida';
    public $timestamps = false;
    protected $guarded = [];

    protected $appends = ['id', 'productos'];

    public function getIdAttribute()
    {
        return $this->attributes['id_salida'];
    }

    public function detalles()
    {
        return $this->hasMany(DetalleSalida::class, 'id_salida', 'id_salida');
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
