<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetalleEntrada extends Model
{
    use HasFactory;
    protected $table = 'detalle_entradas';
    protected $primaryKey = 'id_detalleE';
    public $timestamps = false;
    protected $guarded = [];
}
