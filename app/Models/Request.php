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
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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

    public function offer(): HasMany
    {
        return $this->hasMany(RequestOffer::class);
    }

    // New normalized relationships
    public function detail(): HasOne
    {
        return $this->hasOne(RequestDetail::class);
    }

    public function subthemes(): BelongsToMany
    {
        return $this->belongsToMany(Subtheme::class, 'request_subtheme');
    }

    public function supportTypes(): BelongsToMany
    {
        return $this->belongsToMany(SupportType::class, 'request_support_type');
    }

    public function targetAudiences(): BelongsToMany
    {
        return $this->belongsToMany(TargetAudience::class, 'request_target_audience');
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
