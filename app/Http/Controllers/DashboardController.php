<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $locations = Location::select('id', 'name', 'latitude', 'longitude', 'jenis', 'keterangan', 'foto')->get();

        return Inertia::render('Dashboard', [
            'locations' => $locations,
        ]);
    }
}
