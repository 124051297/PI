<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetalleSalida extends Model
{
    use HasFactory;
    protected $table = 'detalle_salidas';
    protected $primaryKey = 'id_detalle_salida';
    public $timestamps = false;
    protected $guarded = [];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto', 'id_producto');
    }
}
