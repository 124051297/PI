<?php
$modelsPath = __DIR__ . '/app/Models';
$controllersPath = __DIR__ . '/app/Http/Controllers';

$models = ['Role', 'Area', 'Categoria', 'EstadoProducto', 'Empleado', 'Usuario', 'Producto', 'Entrada', 'DetalleEntrada', 'Salida', 'DetalleSalida'];

foreach ($models as $model) {
    // Basic Model logic: protected $guarded = []; matches any table!
    // But table name logic: DetalleEntrada -> detalle_entradas
    $table = strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $model)) . 's'; // simple pluralize
    if ($model === 'DetalleEntrada') $table = 'detalle_entradas';
    if ($model === 'DetalleSalida') $table = 'detalle_salidas';
    if ($model === 'Role') $table = 'roles';
    if ($model === 'EstadoProducto') $table = 'estado_producto';

    $modelContent = "<?php\n\nnamespace App\Models;\n\nuse Illuminate\Database\Eloquent\Factories\HasFactory;\nuse Illuminate\Database\Eloquent\Model;\n\nclass $model extends Model\n{\n    use HasFactory;\n    protected \$table = '$table';\n    protected \$guarded = [];\n}\n";
    file_put_contents("$modelsPath/$model.php", $modelContent);

    // Basic Controller logic:
    // AuthController already done, so skip it. Also UsuarioController will handle users.
    if ($model !== 'Usuario') {
        $controllerName = "{$model}Controller";
        $controllerContent = "<?php\n\nnamespace App\Http\Controllers;\n\nuse App\Models\\$model;\nuse Illuminate\Http\Request;\n\nclass $controllerName extends Controller\n{\n    public function index()\n    {\n        return response()->json($model::all());\n    }\n\n    public function store(Request \$request)\n    {\n        \$item = $model::create(\$request->all());\n        return response()->json(\$item, 201);\n    }\n\n    public function show(\$id)\n    {\n        return response()->json($model::findOrFail(\$id));\n    }\n\n    public function update(Request \$request, \$id)\n    {\n        \$item = $model::findOrFail(\$id);\n        \$item->update(\$request->all());\n        return response()->json(\$item);\n    }\n\n    public function destroy(\$id)\n    {\n        $model::destroy(\$id);\n        return response()->json(null, 204);\n    }\n}\n";
        file_put_contents("$controllersPath/$controllerName.php", $controllerContent);
    }
}

// Write specialized routes
$routesContent = "<?php\n\nuse Illuminate\Http\Request;\nuse Illuminate\Support\Facades\Route;\n\nuse App\Http\Controllers\AuthController;\nuse App\Http\Controllers\AreaController;\nuse App\Http\Controllers\CategoriaController;\nuse App\Http\Controllers\EstadoProductoController;\nuse App\Http\Controllers\EmpleadoController;\nuse App\Http\Controllers\UsuarioController;\nuse App\Http\Controllers\ProductoController;\nuse App\Http\Controllers\EntradaController;\nuse App\Http\Controllers\SalidaController;\n\nRoute::post('/login', [AuthController::class, 'login']);\n\nRoute::middleware('auth:sanctum')->group(function () {\n    Route::post('/logout', [AuthController::class, 'logout']);\n    Route::get('/user', function (Request \$request) { return \$request->user(); });\n\n    Route::apiResource('areas', AreaController::class);\n    Route::apiResource('categorias', CategoriaController::class);\n    Route::apiResource('estados', EstadoProductoController::class);\n    Route::apiResource('empleados', EmpleadoController::class);\n    Route::apiResource('usuarios', UsuarioController::class);\n    Route::apiResource('productos', ProductoController::class);\n    Route::apiResource('entradas', EntradaController::class);\n    Route::apiResource('salidas', SalidaController::class);\n});\n";
file_put_contents(__DIR__ . '/routes/api.php', $routesContent);

echo "Base configurations written.";
