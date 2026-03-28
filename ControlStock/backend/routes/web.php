<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return "
    <div style='font-family: sans-serif; text-align: center; padding-top: 50px;'>
        <h1>🚀 El Backend de ControlStock está CORRIENDO correctamente</h1>
        <p>Este es el servidor de datos (API). <b>Tus 'pantallas' no están aquí</b>, están en el servidor del Frontend.</p>
        <p>Para ver tu sitio web:</p>
        <ol style='display: inline-block; text-align: left;'>
            <li>Abre otra terminal.</li>
            <li>Entra a la carpeta <b>frontend</b>.</li>
            <li>Escribe <b>npm run dev</b>.</li>
            <li>Entra a <b><a href='http://localhost:5173'>http://localhost:5173</a></b></li>
        </ol>
        <br><br>
        <p><i>Nota: El API de datos está disponible en /api/...</i></p>
    </div>
    ";
});

Route::fallback(function () {
    return response()->json([
        'error' => 'Route not found',
        'message' => 'Are you looking for the API? Try /api/...'
    ], 404);
});
