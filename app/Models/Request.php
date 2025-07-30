<?php

namespace App\Models;

use App\Models\Request\Offer;
use App\Models\Request\Detail;
use App\Models\Request\Status;
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function matchedPartner(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class);
    }

    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class);
    }

    // New normalized relationships
    public function detail(): HasOne
    {
        return $this->hasOne(Detail::class);
    }

    /**
     * Relationship: Get the active offer for this request
     */
    public function activeOffer()
    {
        return $this->hasOne(Offer::class)
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

    /**
     * Permission attributes to be appended to model
     */
    protected $appends = ['can_edit', 'can_view', 'can_manage_offers', 'can_update_status'];

    /**
     * Check if current user can edit this request
     */
    public function getCanEditAttribute(): bool
    {
        $user = auth()->user();
        if (!$user) {
            return false;
        }
        // Only the request owner can edit
        return $user->id === $this->user_id && $this->status->status_code === Status::DRAFT_STATUS_CODE;
    }

    /**
     * Check if current user can view this request
     */
    public function getCanViewAttribute(): bool
    {
        $user = auth()->user();

        if (!$user) {
            return false;
        }

        // Request owner, matched partner, or admin can view
        return $user->id === $this->user_id
            || $user->id === $this->matched_partner_id
            || $user->hasRole('administrator');
    }

    /**
     * Check if current user can add offer to this request
     */
    public function getCanManageOffersAttribute(): bool
    {
        $user = auth()->user();
        
        if (!$user) {
            return false;
        }
        
        // Only admins can manage offers
        return $user->hasRole('administrator');
    }

    /**
     * Check if current user can update request status
     */
    public function getCanUpdateStatusAttribute(): bool
    {
        $user = auth()->user();
        
        if (!$user) {
            return false;
        }
        
        // Only administrators can update status
        return $user->hasRole('administrator');
    }
}
