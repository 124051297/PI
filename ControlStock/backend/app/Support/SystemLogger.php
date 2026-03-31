<?php

namespace App\Support;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SystemLogger
{
    private static ?bool $hasEntidadColumn = null;
    private static ?bool $hasDetallesColumn = null;

    public static function log(string $accion, string $entidad = 'Sistema', ?string $detalles = null, ?int $idUsuario = null): void
    {
        $payload = [
            'accion' => $accion,
            'fecha' => now(),
            'id_usuario' => $idUsuario ?? Auth::user()?->id_usuario,
        ];

        if (self::hasEntidadColumn()) {
            $payload['entidad'] = $entidad;
        }

        if (self::hasDetallesColumn()) {
            $payload['detalles'] = $detalles;
        }

        DB::table('bitacora')->insert($payload);
    }

    private static function hasEntidadColumn(): bool
    {
        if (self::$hasEntidadColumn === null) {
            self::$hasEntidadColumn = Schema::hasColumn('bitacora', 'entidad');
        }

        return self::$hasEntidadColumn;
    }

    private static function hasDetallesColumn(): bool
    {
        if (self::$hasDetallesColumn === null) {
            self::$hasDetallesColumn = Schema::hasColumn('bitacora', 'detalles');
        }

        return self::$hasDetallesColumn;
    }
}
