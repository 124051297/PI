<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    use HasFactory;
    protected $table = 'areas';
    protected $primaryKey = 'id_area';
    public $timestamps = true;
    protected $guarded = [];

    protected $appends = ['id', 'nombre', 'fecha_creacion'];

    public function getIdAttribute()
    {
        return $this->attributes['id_area'];
    }

    public function getNombreAttribute()
    {
        return $this->attributes['nombre'];
    }

    public function getFechaCreacionAttribute()
    {
        return $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null;
    }
}
