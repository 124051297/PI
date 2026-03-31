<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bitacora', function (Blueprint $table) {
            if (!Schema::hasColumn('bitacora', 'entidad')) {
                $table->string('entidad', 100)->nullable()->after('accion');
            }

            if (!Schema::hasColumn('bitacora', 'detalles')) {
                $table->text('detalles')->nullable()->after('id_usuario');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bitacora', function (Blueprint $table) {
            if (Schema::hasColumn('bitacora', 'detalles')) {
                $table->dropColumn('detalles');
            }

            if (Schema::hasColumn('bitacora', 'entidad')) {
                $table->dropColumn('entidad');
            }
        });
    }
};
