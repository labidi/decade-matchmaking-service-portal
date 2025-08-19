<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use App\Models\LocationData;
use App\Enums\TargetAudience;
use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Enums\OpportunityStatus;
use App\Enums\OpportunityType;


class Opportunity extends Model
{
    protected $table = 'opportunities';
    protected $primaryKey = 'id';

    public $timestamps = true;
//    protected $appends = ['status_label', 'type_label'];

    protected $casts = [
        'status' => OpportunityStatus::class,
        'target_audience' => 'array',
        'implementation_location' => 'array',
    ];


    public const STATUS_LABELS = [
        OpportunityStatus::ACTIVE->value => 'Active',
        OpportunityStatus::CLOSED->value => 'Closed',
        OpportunityStatus::REJECTED->value => 'Rejected',
        OpportunityStatus::PENDING_REVIEW->value => 'Pending Review',
    ];

    public static function getTypeOptions(): array
    {
        return OpportunityType::getOptions();
    }

    protected $fillable = [
        'title',
        'type',
        'closing_date',
        'coverage_activity',
        'implementation_location',
        'target_audience',
        'target_audience_other',
        'summary',
        'url',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

}
