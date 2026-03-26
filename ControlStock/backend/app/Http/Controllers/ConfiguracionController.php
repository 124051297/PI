<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConfiguracionController extends Controller
{
    public function index()
    {
        $config = DB::table('configuraciones')->pluck('valor', 'clave');
        return response()->json($config);
    }
    
    public function updateLogo(Request $request)
    {
        $logo = $request->input('logo'); // base64 string
        DB::table('configuraciones')
            ->updateOrInsert(
                ['clave' => 'logo_empresa'],
                ['valor' => $logo, 'updated_at' => now()]
            );
        return response()->json(['message' => 'Logo actualizado con éxito']);
    }
}
