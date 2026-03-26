<?php

namespace App\Http\Controllers;

use App\Models\Area;
use Illuminate\Http\Request;

class AreaController extends Controller
{
    public function index()
    {
        return response()->json(Area::all());
    }

    public function store(Request $request)
    {
        $item = Area::create($request->all());
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(Area::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = Area::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        Area::destroy($id);
        return response()->json(null, 204);
    }
}
