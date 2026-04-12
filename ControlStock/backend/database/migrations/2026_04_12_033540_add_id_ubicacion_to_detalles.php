<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('detalle_salidas', function (Blueprint $table) {
            $table->unsignedBigInteger('id_ubicacion')->nullable()->after('cantidad');
            $table->foreign('id_ubicacion')->references('id_ubicacion')->on('ubicaciones');
        });

        Schema::table('detalle_entradas', function (Blueprint $table) {
            $table->unsignedBigInteger('id_ubicacion')->nullable()->after('cantidad');
            $table->foreign('id_ubicacion')->references('id_ubicacion')->on('ubicaciones');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('detalle_entradas', function (Blueprint $table) {
            $table->dropForeign(['id_ubicacion']);
            $table->dropColumn('id_ubicacion');
        });

        Schema::table('detalle_salidas', function (Blueprint $table) {
            $table->dropForeign(['id_ubicacion']);
            $table->dropColumn('id_ubicacion');
        });
    }
};
