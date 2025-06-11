<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Enums\OpportunityStatus;


class Opportunity extends Model
{
    protected $table = 'opportunities';
    protected $primaryKey = 'id';
    public $timestamps = true;
    protected $appends = ['status_label', 'can_edit'];


    const STATUS_LABELS = [
        OpportunityStatus::ACTIVE->value => 'Active',
        OpportunityStatus::CLOSED->value => 'Closed',
        OpportunityStatus::REJECTED->value => 'Rejected',
        OpportunityStatus::PENDING_REVIEW->value => 'Pending Review',
    ];

    protected $casts = [
        'status' => OpportunityStatus::class,
    ];


    protected $fillable = [
        'title',
        'type',
        'closing_date',
        'coverage_activity',
        'implementation_location',
        'target_audience',
        // 'target_audience_other',
        'summary',
        'url',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function statusLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => self::STATUS_LABELS[$this->status->value] ?? '',
        );
    }

    protected function canEdit(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->status === OpportunityStatus::PENDING_REVIEW ,
        );
    }
}
