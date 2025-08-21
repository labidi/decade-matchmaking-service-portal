<?php

namespace App\Http\Resources;

use App\Models\Request\Detail;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Detail
 */
class DetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if (!$this->resource) {
            return [];
        }

        $currentUser = $request->user();
        $requestOwner = $this->resource->request?->user;
        $isOwner = $currentUser && $requestOwner && $currentUser->id === $requestOwner->id;
        $isAdmin = $currentUser && $currentUser->is_admin;
        
        // Determine if user has full access (owner or admin)
        $hasFullAccess = $isOwner || $isAdmin;

        // Public attributes - always visible
        $publicAttributes = [
            'capacity_development_title' => $this->capacity_development_title,
            'related_activity' => $this->related_activity,
            'delivery_format' => $this->delivery_format,
            'subthemes' => $this->transformEnumArray($this->subthemes),
            'subthemes_other' => $this->subthemes_other,
            'support_types' => $this->transformEnumArray($this->support_types),
            'support_types_other' => $this->support_types_other,
            'target_audience' => $this->transformEnumArray($this->target_audience),
            'target_audience_other' => $this->target_audience_other,
            'target_languages' => $this->transformEnumArray($this->target_languages),
            'target_languages_other' => $this->target_languages_other,
            'delivery_countries' => $this->transformEnumArray($this->delivery_countries),
            'gap_description' => $this->gap_description,
            'support_months' => $this->support_months,
            'completion_date' => $this->completion_date?->format('Y-m-d'),
            'expected_outcomes' => $this->expected_outcomes,
            'success_metrics' => $this->success_metrics,
            'long_term_impact' => $this->long_term_impact,
            'project_stage' => $this->project_stage,
            'project_url' => $this->project_url,
        ];

        // Private attributes - only for owner or admin
        if ($hasFullAccess) {
            $privateAttributes = [
                'is_related_decade_action' => $this->is_related_decade_action,
                'unique_related_decade_action_id' => $this->unique_related_decade_action_id,
                'first_name' => $this->first_name,
                'last_name' => $this->last_name,
                'email' => $this->email,
                'has_significant_changes' => $this->has_significant_changes,
                'changes_description' => $this->changes_description,
                'change_effect' => $this->change_effect,
                'request_link_type' => $this->request_link_type,
                'has_partner' => $this->has_partner,
                'partner_name' => $this->partner_name,
                'partner_confirmed' => $this->partner_confirmed,
                'needs_financial_support' => $this->needs_financial_support,
                'budget_breakdown' => $this->budget_breakdown,
                'risks' => $this->risks,
                'personnel_expertise' => $this->personnel_expertise,
                'direct_beneficiaries' => $this->direct_beneficiaries,
                'direct_beneficiaries_number' => $this->direct_beneficiaries_number,
                'additional_data' => $this->additional_data,
            ];

            return array_merge($publicAttributes, $privateAttributes);
        }

        return $publicAttributes;
    }

    /**
     * Transform enum array to include both value and label
     */
    private function transformEnumArray($enumArray): array
    {
        if (!$enumArray) {
            return [];
        }

        $result = [];
        foreach ($enumArray as $enum) {
            if ($enum && method_exists($enum, 'label')) {
                $result[] = [
                    'value' => $enum->value,
                    'label' => $enum->label(),
                ];
            } elseif ($enum) {
                // Fallback for enums without label method
                $result[] = [
                    'value' => is_string($enum) ? $enum : $enum->value,
                    'label' => is_string($enum) ? $enum : $enum->value,
                ];
            }
        }
        
        return $result;
    }
}
