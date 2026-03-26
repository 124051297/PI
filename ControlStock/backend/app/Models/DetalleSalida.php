<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetalleSalida extends Model
{
    use HasFactory;
    protected $table = 'detalle_salidas';
    protected $primaryKey = 'id_detalleS';
    public $timestamps = false;
    protected $guarded = [];
}
