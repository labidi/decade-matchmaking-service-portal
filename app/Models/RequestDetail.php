<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class RequestDetail extends Model
{
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
        'delivery_country',
        'subthemes',
        'support_types',
        'target_audience',
        'subthemes_other',
        'support_types_other',
        'target_audience_other',
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
        'additional_data' => 'array',
        'support_months' => 'integer',
        'direct_beneficiaries_number' => 'integer',
        'completion_date' => 'date',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class);
    }

    public function subthemes(): BelongsToMany
    {
        return $this->belongsToMany(Subtheme::class, 'request_subtheme', 'request_id', 'subtheme_id');
    }

    public function supportTypes(): BelongsToMany
    {
        return $this->belongsToMany(SupportType::class, 'request_support_type', 'request_id', 'support_type_id');
    }

    public function targetAudiences(): BelongsToMany
    {
        return $this->belongsToMany(TargetAudience::class, 'request_target_audience', 'request_id', 'target_audience_id');
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
     * Scope for filtering by country
     */
    public function scopeByCountry($query, string $country)
    {
        return $query->where('delivery_country', $country);
    }

    /**
     * Scope for filtering by financial support need
     */
    public function scopeNeedsFinancialSupport($query, bool $needsSupport = true)
    {
        return $query->where('needs_financial_support', $needsSupport ? 'Yes' : 'No');
    }
} 