<?php

namespace App\Models\Request;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use App\Models\Document;
use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Enums\RequestOfferStatus;

class RequestOffer extends Model
{
    protected $table = 'request_offers';
    protected $primaryKey = 'id';
    public $timestamps = true;
    protected $appends = ['status_label'];


    const STATUS_LABELS = [
        RequestOfferStatus::ACTIVE->value => 'Active',
        RequestOfferStatus::REJECTED->value => 'Rejected',
    ];

    protected $casts = [
        'status' => RequestOfferStatus::class,
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
