<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use App\Enums\DocumentType;

class Document extends Model
{
    protected $fillable = [
        'name',
        'path',
        'file_type',
        'document_type',
        'parent_id',
        'parent_type',
        'uploader_id',
    ];


    protected $casts = [
        'document_type' => DocumentType::class,
    ];

    public function parent(): MorphTo
    {
        return $this->morphTo();
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploader_id');
    }
}
