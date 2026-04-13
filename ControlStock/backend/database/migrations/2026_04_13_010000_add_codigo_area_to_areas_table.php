<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('areas', function (Blueprint $table) {
            $table->string('codigo_area', 100)->unique()->nullable()->after('nombre');
        });

        // Generate codes for existing areas that don't have one
        $areas = DB::table('areas')->whereNull('codigo_area')->get();
        foreach ($areas as $area) {
            DB::table('areas')
                ->where('id_area', $area->id_area)
                ->update([
                    'codigo_area' => 'AREA-' . str_pad($area->id_area, 4, '0', STR_PAD_LEFT)
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('areas', function (Blueprint $table) {
            $table->dropColumn('codigo_area');
        });
    }
};
