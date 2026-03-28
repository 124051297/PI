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
        Schema::create('roles', function (Blueprint $table) {
            $table->id('id_rol');
            $table->string('nombre', 100);
        });

        Schema::create('areas', function (Blueprint $table) {
            $table->id('id_area');
            $table->string('nombre', 100);
        });

        Schema::create('categorias', function (Blueprint $table) {
            $table->id('id_categoria');
            $table->string('nombre', 100);
        });

        Schema::create('empleados', function (Blueprint $table) {
            $table->id('id_empleado');
            $table->unsignedBigInteger('id_area');
            $table->unsignedBigInteger('id_rol');
            $table->string('nombre', 100);
            $table->string('ap', 70);
            $table->string('am', 70)->nullable();
            $table->string('telefono', 20)->unique()->nullable();
            $table->string('correo', 150)->unique()->nullable();
            $table->foreign('id_area')->references('id_area')->on('areas');
            $table->foreign('id_rol')->references('id_rol')->on('roles');
        });

        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('id_usuario');
            $table->string('nombre_usuario', 50)->unique();
            $table->string('password', 255);
            $table->date('ultima_modificacion')->nullable();
            $table->unsignedBigInteger('id_empleado');
            $table->foreign('id_empleado')->references('id_empleado')->on('empleados');
        });

        Schema::create('productos', function (Blueprint $table) {
            $table->id('id_producto');
            $table->string('nombre_producto', 250);
            $table->decimal('precio_unitario', 10, 2);
            $table->integer('stock_minimo');
            $table->unsignedBigInteger('id_categoria');
            $table->foreign('id_categoria')->references('id_categoria')->on('categorias');
        });

        Schema::create('ubicaciones', function (Blueprint $table) {
            $table->id('id_ubicacion');
            $table->unsignedBigInteger('id_area');
            $table->string('pasillo', 50);
            $table->string('estante', 50);
            $table->string('nivel', 50);
            $table->string('codigo_ubicacion', 100)->unique()->nullable();
            $table->foreign('id_area')->references('id_area')->on('areas');
        });

        Schema::create('inventarios', function (Blueprint $table) {
            $table->id('id_inventario');
            $table->unsignedBigInteger('id_producto');
            $table->unsignedBigInteger('id_ubicacion');
            $table->integer('stock_actual')->default(0);
            $table->foreign('id_producto')->references('id_producto')->on('productos');
            $table->foreign('id_ubicacion')->references('id_ubicacion')->on('ubicaciones');
            $table->unique(['id_producto', 'id_ubicacion']);
        });

        Schema::create('entradas', function (Blueprint $table) {
            $table->id('id_entrada');
            $table->datetime('fecha');
            $table->unsignedBigInteger('id_empleado');
            $table->unsignedBigInteger('id_area');
            $table->text('observaciones')->nullable();
            $table->foreign('id_empleado')->references('id_empleado')->on('empleados');
            $table->foreign('id_area')->references('id_area')->on('areas');
        });

        Schema::create('detalle_entradas', function (Blueprint $table) {
            $table->id('id_detalleE');
            $table->unsignedBigInteger('id_entrada');
            $table->unsignedBigInteger('id_producto');
            $table->integer('cantidad');
            $table->foreign('id_entrada')->references('id_entrada')->on('entradas');
            $table->foreign('id_producto')->references('id_producto')->on('productos');
        });

        Schema::create('salidas', function (Blueprint $table) {
            $table->id('id_salida');
            $table->datetime('fecha');
            $table->unsignedBigInteger('id_empleado');
            $table->unsignedBigInteger('id_area');
            $table->text('observaciones')->nullable();
            $table->foreign('id_empleado')->references('id_empleado')->on('empleados');
            $table->foreign('id_area')->references('id_area')->on('areas');
        });

        Schema::create('detalle_salidas', function (Blueprint $table) {
            $table->id('id_detalleS');
            $table->unsignedBigInteger('id_salida');
            $table->unsignedBigInteger('id_producto');
            $table->integer('cantidad');
            $table->foreign('id_salida')->references('id_salida')->on('salidas');
            $table->foreign('id_producto')->references('id_producto')->on('productos');
        });

        Schema::create('bitacora', function (Blueprint $table) {
            $table->id('id_log');
            $table->string('accion', 255);
            $table->datetime('fecha');
            $table->unsignedBigInteger('id_usuario')->nullable();
            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bitacora');
        Schema::dropIfExists('detalle_salidas');
        Schema::dropIfExists('salidas');
        Schema::dropIfExists('detalle_entradas');
        Schema::dropIfExists('entradas');
        Schema::dropIfExists('inventarios');
        Schema::dropIfExists('ubicaciones');
        Schema::dropIfExists('productos');
        Schema::dropIfExists('usuarios');
        Schema::dropIfExists('empleados');
        Schema::dropIfExists('categorias');
        Schema::dropIfExists('areas');
        Schema::dropIfExists('roles');
    }
};
