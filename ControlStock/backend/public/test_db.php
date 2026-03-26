<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use Illuminate\Support\Facades\DB;

try {
    DB::statement("
        CREATE TABLE IF NOT EXISTS historial_movimientos (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            usuario VARCHAR(255) NULL,
            accion VARCHAR(100) NOT NULL,
            entidad VARCHAR(100) NOT NULL,
            entidad_id BIGINT NULL,
            detalles TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");
    echo "Table created successfully.";
} catch(\Exception $e) {
    echo "Error: " . $e->getMessage();
}
