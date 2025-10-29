<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Location extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'locations';
    protected $primaryKey = 'id';
    protected $fillable = [
        'id',
        'name',
        'jenis',
        'keterangan',
        'foto',
        'latitude',
        'longitude',
    ];


    public function jenis_lokasi(): BelongsTo
    {
        return $this->belongsTo(JenisLokasi::class, 'jenis', 'id');
    }
}
