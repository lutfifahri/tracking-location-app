<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index()
    {
        return Inertia::render('Locations/Index', [
            'locations' => Location::all()
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'jenis' => 'nullable|string|max:255',
            'keterangan' => 'nullable|string',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('locations', 'public');
            $data['foto'] = $path;
        }

        Location::create($data);

        return redirect()->back()->with('success', 'Lokasi berhasil disimpan');
    }

    public function edit(Location $location)
    {
        return Inertia::render('Locations/Edit', [
            'location' => $location
        ]);
    }

    public function update(Request $request, Location $location)
    {
        try {
            // Ambil field
            $data = $request->only(['name', 'jenis', 'keterangan', 'latitude', 'longitude']);

            if ($request->hasFile('foto')) {
                if ($location->foto && Storage::disk('public')->exists($location->foto)) {
                    Storage::disk('public')->delete($location->foto);
                }
                $data['foto'] = $request->file('foto')->store('locations', 'public');
            } else {
                $data['foto'] = $location->foto;
            }

            $location->update($data);


            return redirect()->route('locations.index')->with('success', 'Lokasi berhasil diperbarui!');
        } catch (\Exception $e) {
            Log::error('Gagal update lokasi', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->with('error', 'Terjadi kesalahan saat memperbarui data.');
        }
    }

    public function destroy(Location $location)
    {
        $location->delete();
        return redirect()->back();
    }
}
