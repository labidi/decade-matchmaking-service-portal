<?php

namespace App\Models\Request;

use App\Models\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Detail extends Model
{
    protected $table = 'request_details';
    protected $fillable = [
        'request_id',
        'capacity_development_title',
        'is_related_decade_action',
        'unique_related_decade_action_id',
        'first_name',
        'last_name',
        'email',
        'has_significant_changes',
        'changes_description',
        'change_effect',
        'request_link_type',
        'project_stage',
        'project_url',
        'related_activity',
        'delivery_format',
        'delivery_countries',
        'subthemes',
        'support_types',
        'target_audience',
        'target_languages',
        'subthemes_other',
        'support_types_other',
        'target_audience_other',
        'target_languages_other',
        'gap_description',
        'has_partner',
        'partner_name',
        'partner_confirmed',
        'needs_financial_support',
        'budget_breakdown',
        'support_months',
        'completion_date',
        'risks',
        'personnel_expertise',
        'direct_beneficiaries',
        'direct_beneficiaries_number',
        'expected_outcomes',
        'success_metrics',
        'long_term_impact',
        'additional_data'
    ];

    protected $casts = [
        'subthemes' => 'array',
        'support_types' => 'array',
        'target_audience' => 'array',
        'target_languages' => 'array',
        'additional_data' => 'array',
        'support_months' => 'integer',
        'direct_beneficiaries_number' => 'integer',
        'completion_date' => 'datetime:Y-m-d',
        'delivery_countries' => 'array',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class);
    }



    /**
     * Get full name of the requester
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Scope for searching by full-text search
     */
    public function scopeSearch($query, string $searchTerm)
    {
        return $query->whereFullText(['capacity_development_title', 'gap_description', 'expected_outcomes'], $searchTerm);
    }

    /**
     * Scope for filtering by activity type
     */
    public function scopeByActivityType($query, string $activityType)
    {
        return $query->where('related_activity', $activityType);
    }

    /**
     * Scope for filtering by delivery format
     */
    public function scopeByDeliveryFormat($query, string $deliveryFormat)
    {
        return $query->where('delivery_format', $deliveryFormat);
    }

    /**
     * Scope for filtering by financial support need
     */
    public function scopeNeedsFinancialSupport($query, bool $needsSupport = true)
    {
        return $query->where('needs_financial_support', $needsSupport ? 'Yes' : 'No');
    }
}
