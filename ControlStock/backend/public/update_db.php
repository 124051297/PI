<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use Illuminate\Support\Facades\DB;

try {
    try {
        DB::statement("ALTER TABLE usuarios MODIFY COLUMN foto_perfil LONGTEXT NULL");
    } catch (\Exception $e) { }
    try {
        DB::statement("ALTER TABLE configuraciones MODIFY COLUMN valor LONGTEXT NULL");
    } catch (\Exception $e) { }

    echo "Columns modified successfully.";
} catch(\Exception $e) {
    echo "Error: " . $e->getMessage();
}
