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
    protected $appends = ['status_label','type_label'];


    public const STATUS_LABELS = [
        OpportunityStatus::ACTIVE->value => 'Active',
        OpportunityStatus::CLOSED->value => 'Closed',
        OpportunityStatus::REJECTED->value => 'Rejected',
        OpportunityStatus::PENDING_REVIEW->value => 'Pending Review',
    ];

    /**
     * Available opportunity types
     */
    public const TYPE_OPTIONS = [
        'training' => 'Training',
        'onboarding-expeditions' => 'Onboarding Expeditions, Research & Training',
        'fellowships' => 'Fellowships',
        'internships-jobs' => 'Internships/Jobs',
        'mentorships' => 'Mentorships',
        'visiting-lecturers' => 'Visiting Lecturers/Scholars',
        'travel-grants' => 'Travel Grants',
        'awards' => 'Awards',
        'research-funding' => 'Research Fundings, Grants & Scholarships',
        'access-infrastructure' => 'Access to Infrastructure',
        'ocean-data' => 'Ocean Data, Information and Documentation',
        'networks-community' => 'Professional Networks & Community Building',
        'ocean-literacy' => 'Ocean Literacy, Public Information and Communication',
    ];

    public static function getTypeOptions(): array
    {
        return self::TYPE_OPTIONS;
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
            get: fn() => self::TYPE_OPTIONS[$this->type] ?? '',
        );
    }

}
