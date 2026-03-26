<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empleado extends Model
{
    use HasFactory;
    protected $table = 'empleados';
    protected $primaryKey = 'id_empleado';
    public $timestamps = false;
    protected $guarded = [];

    protected $appends = ['id', 'area', 'rol'];

    public function getIdAttribute()
    {
        return $this->attributes['id_empleado'];
    }

    public function getAreaAttribute()
    {
        $area = \App\Models\Area::find($this->id_area);
        return $area ? $area->nombre : 'Sin Área';
    }

    public function getRolAttribute()
    {
        $rol = \App\Models\Role::find($this->id_rol);
        return $rol ? $rol->nombre : 'Sin Rol';
    }
}
