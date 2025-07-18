<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use App\Models\LocationData;
use App\Models\Data\TargetAudienceOptions;
use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Enums\OpportunityStatus;
use App\Models\Data\OpportunityTypeOptions;


class Opportunity extends Model
{
    protected $table = 'opportunities';
    protected $primaryKey = 'id';
    public $timestamps = true;
    protected $appends = ['status_label','type_label','implementation_location_label','target_audience_label'];


    public const STATUS_LABELS = [
        OpportunityStatus::ACTIVE->value => 'Active',
        OpportunityStatus::CLOSED->value => 'Closed',
        OpportunityStatus::REJECTED->value => 'Rejected',
        OpportunityStatus::PENDING_REVIEW->value => 'Pending Review',
    ];

    public static function getTypeOptions(): array
    {
        return OpportunityTypeOptions::getOptions();
    }

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

    protected function typeLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => OpportunityTypeOptions::getLabel($this->type),
        );
    }

    /**
     * Get the formatted implementation location label
     */
    protected function implementationLocationLabel(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->implementation_location || !$this->coverage_activity) {
                    return '';
                }

                return LocationData::getImplementationLocationLabel(
                    $this->implementation_location,
                    $this->coverage_activity
                );
            }
        );
    }

    /**
     * Get the formatted target audience label
     */
    protected function targetAudienceLabel(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->target_audience) {
                    return '';
                }

                return TargetAudienceOptions::getLabel($this->target_audience);
            }
        );
    }
}
