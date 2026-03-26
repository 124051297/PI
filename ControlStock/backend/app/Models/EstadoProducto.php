<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstadoProducto extends Model
{
    use HasFactory;
    protected $table = 'estado_producto';
    protected $primaryKey = 'id_estado';
    public $timestamps = false;
    protected $guarded = [];
}
