<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('http://localhost:5173');
});

Route::fallback(function () {
    return redirect('http://localhost:5173');
});
