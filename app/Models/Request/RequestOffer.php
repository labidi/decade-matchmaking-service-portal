<?php

namespace App\Models\Request;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use App\Models\Document;
use Illuminate\Database\Eloquent\Casts\Attribute;

class RequestOffer extends Model
{
    protected $table = 'request_offers';
    protected $primaryKey = 'id';
    public $timestamps = true;
    protected $appends = ['status_label'];


    const STATUS = [
        'ACTIVE' => 1,
        'REJECTED' => 2,
    ];

    const STATUS_LABELS = [
        self::STATUS['ACTIVE'] => 'Active',
        self::STATUS['REJECTED'] => 'Rejected',
    ];


    protected $fillable = [
        'description',
        'status',
    ];

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'parent');
    }

    protected function statusLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => self::STATUS_LABELS[$this->status] ?? '',
        );
    }
}
