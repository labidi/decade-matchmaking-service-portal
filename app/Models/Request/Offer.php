<?php

namespace App\Models\Request;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use App\Models\Document;
use App\Models\Request;
use App\Models\User;
use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Enums\RequestOfferStatus;

class Offer extends Model
{
    protected $table = 'request_offers';
    protected $primaryKey = 'id';
    public $timestamps = true;
    protected $appends = ['status_label'];


    const STATUS_LABELS = [
        RequestOfferStatus::ACTIVE->value => 'Active',
        RequestOfferStatus::INACTIVE->value => 'Inactive',
    ];

    protected $casts = [
        'status' => RequestOfferStatus::class,
    ];


    protected $fillable = [
        'request_id',
        'matched_partner_id',
        'description',
        'status',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class);
    }

    public function matchedPartner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'matched_partner_id');
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'parent');
    }

    protected function statusLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => Offer::STATUS_LABELS[$this->status->value] ?? '',
        );
    }
}
