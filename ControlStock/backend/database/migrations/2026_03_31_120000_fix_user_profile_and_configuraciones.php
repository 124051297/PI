<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('usuarios', 'foto_perfil')) {
            Schema::table('usuarios', function (Blueprint $table) {
                $table->longText('foto_perfil')->nullable()->after('password');
            });
        }

        if (!Schema::hasTable('configuraciones')) {
            Schema::create('configuraciones', function (Blueprint $table) {
                $table->id();
                $table->string('clave')->unique();
                $table->longText('valor')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('configuraciones')) {
            Schema::dropIfExists('configuraciones');
        }

        if (Schema::hasColumn('usuarios', 'foto_perfil')) {
            Schema::table('usuarios', function (Blueprint $table) {
                $table->dropColumn('foto_perfil');
            });
        }
    }
};
