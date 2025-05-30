<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use Illuminate\Database\Eloquent\Casts\Attribute;


class Opportunity extends Model
{
    protected $table = 'opportunities';
    protected $primaryKey = 'id';
    public $timestamps = true;
    protected $appends = ['status_label', 'can_edit'];


    const STATUS = [
        'ACTIVE' => 1,
        'CLOSED' => 2,
        'REJECTED' => 3,
        'PENDING_REVIEW' => 4,
    ];

    const STATUS_LABELS = [
        self::STATUS['ACTIVE'] => 'Active',
        self::STATUS['CLOSED'] => 'Closed',
        self::STATUS['REJECTED'] => 'Rejected',
        self::STATUS['PENDING_REVIEW'] => 'Pending Review',
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
            get: fn() => self::STATUS_LABELS[$this->status] ?? '',
        );
    }

    protected function canEdit(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->status === self::STATUS['PENDING_REVIEW'] ,
        );
    }
}
