<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    use HasFactory;
    protected $table = 'areas';
    protected $primaryKey = 'id_area';
    public $timestamps = false;
    protected $guarded = [];

    protected $appends = ['id', 'nombre'];

    public function getIdAttribute()
    {
        return $this->attributes['id_area'];
    }

    public function getNombreAttribute()
    {
        return $this->attributes['nombre'];
    }
}
