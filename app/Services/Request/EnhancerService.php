<?php

namespace App\Services\Request;

use App\Enums\Common\Country;
use App\Enums\Common\TargetAudience;
use App\Enums\Opportunity\DeliveryFormat;
use App\Enums\Request\RelatedActivity;
use App\Enums\Request\SubTheme;
use App\Enums\Request\SupportType;
use App\Models\Request;

class EnhancerService
{
    /**
     * Get enhanced labels for subthemes
     */
    public static function getSubthemeLabels(array $subthemes): array
    {
        return array_map(fn($value) => SubTheme::getLabelByValue($value), $subthemes);
    }

    /**
     * Get enhanced labels for support types
     */
    public static function getSupportTypeLabels(array $supportTypes): array
    {
        return array_map(fn($value) => SupportType::getLabelByValue($value), $supportTypes);
    }

    /**
     * Get enhanced label for delivery format
     */
    public static function getDeliveryFormatLabel(string $deliveryFormat): string
    {
        return DeliveryFormat::getLabelByValue($deliveryFormat);
    }

    /**
     * Get enhanced label for related activity
     */
    public static function getRelatedActivityLabel(string $relatedActivity): string
    {
        return RelatedActivity::getLabelByValue($relatedActivity);
    }

    /**
     * Get enhanced labels for target audience
     */
    public static function getTargetAudienceLabels(array $targetAudience): array
    {
        return array_map(fn($value) => TargetAudience::getLabelByValue($value), $targetAudience);
    }

    /**
     * Get enhanced labels for countries
     */
    public static function getCountryLabels(array $countries): array
    {
        return array_map(fn($value) => Country::getLabelByValue($value), $countries);
    }

    /**
     * Get all enhanced data for a request
     */
    public static function enhanceRequest(Request $request): array
    {
        return [
            'id' => $request->id,
            'is_partner' => $request->is_partner,
            'unique_id' => $request->unique_id,
            'detail' => [
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'capacity_development_title' => $request->capacity_development_title,
                'has_significant_changes' => $request->has_significant_changes,
                'changes_description' => $request->changes_description,
                'change_effect' => $request->change_effect,
                'request_link_type' => $request->request_link_type,
                'project_stage' => $request->project_stage,
                'project_url' => $request->project_url,
                'related_activity' => $request->related_activity,
                'related_activity_label' => $request->related_activity ? RelatedActivity::getLabelByValue(
                    $request->related_activity
                ) : null,
                'subthemes' => $request->subthemes,
                'subthemes_labels' => is_array($request->subthemes) ? array_map(fn($value) => SubTheme::getLabelByValue($value),
                    $request->subthemes) : [],
                'support_types' => $request->support_types,
                'support_types_labels' => is_array($request->support_types) ? array_map(
                    fn($value) => SupportType::getLabelByValue($value),
                    $request->support_types
                ) : [],
                'gap_description' => $request->gap_description,
                'has_partner' => $request->has_partner,
                'partner_name' => $request->partner_name,
                'partner_confirmed' => $request->partner_confirmed,
                'needs_financial_support' => $request->needs_financial_support,
                'budget_breakdown' => $request->budget_breakdown,
                'support_months' => $request->support_months,
                'completion_date' => $request->completion_date,
                'risks' => $request->risks,
                'personnel_expertise' => $request->personnel_expertise,
                'direct_beneficiaries' => $request->direct_beneficiaries,
                'direct_beneficiaries_number' => $request->direct_beneficiaries_number,
                'expected_outcomes' => $request->expected_outcomes,
                'success_metrics' => $request->success_metrics,
                'long_term_impact' => $request->long_term_impact,
                'target_audience' => $request->target_audience,
                'target_audience_labels' => is_array($request->target_audience) ? array_map(
                    fn($value) => TargetAudience::getLabelByValue($value),
                    $request->target_audience
                ) : [],
                'target_audience_other' => $request->target_audience_other,
                'delivery_format' => $request->delivery_format,
                'delivery_format_label' => $request->delivery_format ? DeliveryFormat::getLabelByValue(
                    $request->delivery_format
                ) : null,
                'delivery_countries' => $request->delivery_countries,
                'delivery_countries_labels' => is_array($request->delivery_countries) ? array_map(
                    fn($value) => Country::getLabelByValue($value),
                    $request->delivery_countries
                ) : [],
                'subthemes_other' => $request->subthemes_other,
                'support_types_other' => $request->support_types_other,
                'is_related_decade_action' => $request->is_related_decade_action,
            ],
            'status' => [
                'status_label' => $request->status?->status_label,
                'status_code' => $request->status?->status_code,
            ]
        ];
    }
}
