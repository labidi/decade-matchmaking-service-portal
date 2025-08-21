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
            'support_months' => $this->support_months,
            'subthemes' => $this->transformEnumArray($this->subthemes),
            'subthemes_other' => $this->subthemes_other,
            'related_activity' => $this->related_activity,
            'support_types' => $this->transformEnumArray($this->support_types),
            'support_types_other' => $this->support_types_other,
            'delivery_format' => $this->delivery_format,
            'delivery_countries' => $this->transformEnumArray($this->delivery_countries),
            'target_audience' => $this->transformEnumArray($this->target_audience),
            'target_audience_other' => $this->target_audience_other,
            'gap_description' => $this->gap_description,
        ];

        // Private attributes - only for owner or admin
        if ($hasFullAccess) {
            $privateAttributes = [
                'additional_data' => $this->additional_data,
                'budget_breakdown' => $this->budget_breakdown,
                'change_effect' => $this->change_effect,
                'changes_description' => $this->changes_description,
                'completion_date' => $this->completion_date?->format('Y-m-d'),
                'direct_beneficiaries' => $this->direct_beneficiaries,
                'direct_beneficiaries_number' => $this->direct_beneficiaries_number,
                'email' => $this->email,
                'expected_outcomes' => $this->expected_outcomes,
                'first_name' => $this->first_name,
                'has_partner' => $this->has_partner,
                'has_significant_changes' => $this->has_significant_changes,
                'is_related_decade_action' => $this->is_related_decade_action,
                'last_name' => $this->last_name,
                'long_term_impact' => $this->long_term_impact,
                'needs_financial_support' => $this->needs_financial_support,
                'partner_confirmed' => $this->partner_confirmed,
                'partner_name' => $this->partner_name,
                'personnel_expertise' => $this->personnel_expertise,
                'project_stage' => $this->project_stage,
                'project_url' => $this->project_url,
                'request_link_type' => $this->request_link_type,
                'risks' => $this->risks,
                'success_metrics' => $this->success_metrics,
                'target_languages' => $this->transformEnumArray($this->target_languages),
                'target_languages_other' => $this->target_languages_other,
                'unique_related_decade_action_id' => $this->unique_related_decade_action_id,
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
