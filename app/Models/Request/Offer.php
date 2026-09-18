<?php

namespace App\Models\Request;

use App\Domains\Document\Models\Document;
use App\Domains\User\Models\User;
use App\Enums\Offer\RequestOfferStatus;
use App\Models\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Offer extends Model
{
    protected $table = 'request_offers';

    protected $primaryKey = 'id';

    public $timestamps = true;

    protected $casts = [
        'status' => RequestOfferStatus::class,
        'is_accepted' => 'boolean',
    ];

    protected $fillable = [
        'request_id',
        'matched_partner_id',
        'description',
        'status',
        'is_accepted',
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
}
