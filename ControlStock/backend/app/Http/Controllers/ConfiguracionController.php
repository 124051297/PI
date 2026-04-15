<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ConfiguracionController extends Controller
{
    public function index()
    {
        if (!Schema::hasTable('configuraciones')) {
            return response()->json([]);
        }

        $config = DB::table('configuraciones')->pluck('valor', 'clave')->toArray();

        if (!empty($config['logo_empresa'])) {
            $config['logo_empresa_url'] = $this->resolveStoredAssetUrl($config['logo_empresa']);
        }

        return response()->json($config);
    }

    public function updateLogo(Request $request)
    {
        if (!Schema::hasTable('configuraciones')) {
            return response()->json([
                'message' => 'La tabla de configuraciones no existe. Ejecuta las migraciones pendientes.',
            ], 500);
        }

        $request->validate([
            'logo' => 'nullable|string',
            'logo_file' => 'nullable|image|max:4096',
        ]);

        if (!$request->hasFile('logo_file') && !$request->filled('logo')) {
            return response()->json([
                'message' => 'Debes enviar una imagen para actualizar el logo.',
            ], 422);
        }

        $currentPath = DB::table('configuraciones')->where('clave', 'logo_empresa')->value('valor');
        $storedValue = $request->hasFile('logo_file')
            ? $request->file('logo_file')->store('configuracion', 'public')
            : $this->storeBase64Asset($request->input('logo'), 'configuracion');

        if ($currentPath && $currentPath !== $storedValue) {
            $this->deleteStoredAsset($currentPath);
        }

        DB::table('configuraciones')->updateOrInsert(
            ['clave' => 'logo_empresa'],
            ['valor' => $storedValue, 'created_at' => now(), 'updated_at' => now()]
        );

        return response()->json([
            'message' => 'Logo actualizado con éxito',
            'logo' => $storedValue,
            'logo_url' => $this->resolveStoredAssetUrl($storedValue),
        ]);
    }

    public function resetLogo()
    {
        if (!Schema::hasTable('configuraciones')) {
            return response()->json(['message' => 'Configuración restaurada.']);
        }

        $currentPath = DB::table('configuraciones')->where('clave', 'logo_empresa')->value('valor');
        if ($currentPath) {
            $this->deleteStoredAsset($currentPath);
        }

        DB::table('configuraciones')->where('clave', 'logo_empresa')->delete();

        return response()->json([
            'message' => 'Logo restaurado al predeterminado.',
        ]);
    }

    private function storeBase64Asset(string $value, string $directory): string
    {
        if (!preg_match('/^data:image\/(\w+);base64,/', $value, $matches)) {
            return $value;
        }

        $extension = strtolower($matches[1]);
        $encoded = substr($value, strpos($value, ',') + 1);
        $binary = base64_decode($encoded, true);

        if ($binary === false) {
            return $value;
        }

        $filename = $directory . '/' . Str::uuid() . '.' . $extension;
        Storage::disk('public')->put($filename, $binary);

        return $filename;
    }

    private function resolveStoredAssetUrl(string $value): string
    {
        if (Str::startsWith($value, ['http://', 'https://', 'data:'])) {
            return $value;
        }

        return asset('storage/' . ltrim($value, '/'));
    }

    private function deleteStoredAsset(?string $path): void
    {
        if (!$path || Str::startsWith($path, ['http://', 'https://', 'data:'])) {
            return;
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
