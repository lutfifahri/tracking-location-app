<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisLokasi extends Model
{
    protected $table = 'jenis_lokasi';
    protected $primaryKey = 'id';
    protected $fillable = [
        'id',
        'nama',
        'keterangan',
    ];
}
