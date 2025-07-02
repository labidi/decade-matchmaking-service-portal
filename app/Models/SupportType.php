<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SupportType extends Model
{
    protected $fillable = [
        'name',
        'description',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function requests(): BelongsToMany
    {
        return $this->belongsToMany(Request::class, 'request_support_type');
    }

    public static function getActiveSupportTypes(): \Illuminate\Database\Eloquent\Collection
    {
        return static::where('is_active', true)->orderBy('name')->get();
    }
} 