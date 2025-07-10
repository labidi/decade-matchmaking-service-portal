<?php

namespace App\Models;

use App\Models\Request\RequestOffer;
use App\Models\Request\RequestStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;


class Request extends Model
{
    protected $table = 'requests';
    protected $primaryKey = 'id';

    protected $fillable = [
        'request_data',
        'status_id',
        'user_id',
        'matched_partner_id'
    ];

    protected $hidden = ['updated_at'];


    protected function requestData(): Attribute
    {

        return Attribute::make(
            get: fn(?string $value) => json_decode($value),
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function MatchedPartner(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function status(): belongsTo
    {
        return $this->belongsTo(RequestStatus::class);
    }

    public function offers(): HasMany
    {
        return $this->hasMany(RequestOffer::class);
    }

    // New normalized relationships
    public function detail(): HasOne
    {
        return $this->hasOne(RequestDetail::class);
    }

    /**
     * Relationship: Get the active offer for this request
     */
    public function activeOffer()
    {
        return $this->hasOne(RequestOffer::class)
            ->where('status', \App\Enums\RequestOfferStatus::ACTIVE);
    }

    /**
     * Accessor: Get the active offer as an attribute
     */
    public function getActiveOfferAttribute()
    {
        return $this->activeOffer()->first();
    }


    /**
     * Get request title (from normalized data if available, fallback to JSON)
     */
    public function getTitleAttribute(): string
    {
        if ($this->detail) {
            return $this->detail->capacity_development_title ?? 'N/A';
        }

        return $this->request_data?->capacity_development_title ?? 'N/A';
    }

    /**
     * Get requester full name (from normalized data if available, fallback to JSON)
     */
    public function getRequesterNameAttribute(): string
    {
        if ($this->detail) {
            return $this->detail->full_name;
        }

        $data = $this->request_data;
        if ($data && isset($data->first_name) && isset($data->last_name)) {
            return trim($data->first_name . ' ' . $data->last_name);
        }

        return 'N/A';
    }

    /**
     * Check if request has normalized data
     */
    public function hasNormalizedData(): bool
    {
        return $this->detail !== null;
    }
}
