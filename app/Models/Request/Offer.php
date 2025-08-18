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
    protected $appends = ['status_label', 'can_edit', 'can_view', 'can_delete', 'can_accept'];


    const STATUS_LABELS = [
        RequestOfferStatus::ACTIVE->value => 'Active',
        RequestOfferStatus::INACTIVE->value => 'Inactive',
    ];

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

    protected function statusLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => Offer::STATUS_LABELS[$this->status?->value] ?? '',
        );
    }

    /**
     * Check if current user can edit this offer
     */
    public function getCanEditAttribute(): bool
    {
        $user = auth()->user();

        if (!$user) {
            return false;
        }

        // Only admins or the offer creator can edit
        return $user->hasRole('administrator') || $user->id === $this->matched_partner_id;
    }

    /**
     * Check if current user can view this offer
     */
    public function getCanViewAttribute(): bool
    {
        $user = auth()->user();

        if (!$user) {
            return false;
        }

        // Admin, offer creator, or request owner can view
        return $user->hasRole('administrator')
            || $user->id === $this->matched_partner_id
            || $user->id === $this->request->user_id;
    }

    /**
     * Check if current user can delete this offer
     */
    public function getCanDeleteAttribute(): bool
    {
        $user = auth()->user();

        if (!$user) {
            return false;
        }

        // Only admins can delete offers
        return $user->hasRole('administrator');
    }

    /**
     * Check if current user can accept this offer
     */
    public function getCanAcceptAttribute(): bool
    {
        $user = auth()->user();

        if (!$user) {
            return false;
        }
        if(!$this->request) {
            return false; // Ensure request is loaded
        }

        // Only the request owner can accept offers for their request
        // And the offer must be active and not already accepted
        return $user->id === $this->request->user_id
            && $this->status === RequestOfferStatus::ACTIVE
            && !$this->is_accepted;
    }
}
