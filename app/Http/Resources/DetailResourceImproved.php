<?php

namespace App\Http\Resources;

use App\Models\Request\Detail;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Detail
 */
class DetailResourceImproved extends JsonResource
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

        $accessLevel = $this->determineAccessLevel($request);
        $publicAttributes = $this->getPublicAttributes();

        if ($accessLevel['hasFullAccess']) {
            return array_merge($publicAttributes, $this->getPrivateAttributes());
        }

        return $publicAttributes;
    }

    /**
     * Determine user access level for this resource
     */
    private function determineAccessLevel(Request $request): array
    {
        $currentUser = $request->user();
        
        if (!$currentUser) {
            return ['hasFullAccess' => false, 'reason' => 'unauthenticated'];
        }

        // Check if request relationship is properly loaded
        $requestModel = $this->resource->request;
        if (!$requestModel) {
            return ['hasFullAccess' => false, 'reason' => 'no_request'];
        }

        // Ensure user relationship is loaded to avoid N+1
        if (!$requestModel->relationLoaded('user')) {
            $requestModel->load('user');
        }

        $requestOwner = $requestModel->user;
        if (!$requestOwner) {
            return ['hasFullAccess' => false, 'reason' => 'no_owner'];
        }

        $isOwner = $currentUser->id === $requestOwner->id;
        $isAdmin = $currentUser->is_admin;
        
        return [
            'hasFullAccess' => $isOwner || $isAdmin,
            'isOwner' => $isOwner,
            'isAdmin' => $isAdmin,
            'reason' => $isOwner ? 'owner' : ($isAdmin ? 'admin' : 'unauthorized')
        ];
    }

    /**
     * Get public attributes that are always visible
     */
    private function getPublicAttributes(): array
    {
        return [
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
    }

    /**
     * Get private attributes that require special permissions
     */
    private function getPrivateAttributes(): array
    {
        return [
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
    }

    /**
     * Transform enum array to include both value and label
     */
    private function transformEnumArray($enumArray): array
    {
        if (empty($enumArray)) {
            return [];
        }

        $result = [];
        foreach ($enumArray as $enum) {
            if (!$enum) {
                continue; // Skip null/empty values
            }

            // Handle proper enum objects with label method
            if (is_object($enum) && method_exists($enum, 'label')) {
                $result[] = [
                    'value' => $enum->value,
                    'label' => $enum->label(),
                ];
                continue;
            }

            // Handle string values or enum objects without label method
            if (is_string($enum)) {
                $result[] = [
                    'value' => $enum,
                    'label' => $enum, // Could be improved with translation
                ];
                continue;
            }

            // Handle enum objects without label method
            if (is_object($enum) && property_exists($enum, 'value')) {
                $result[] = [
                    'value' => $enum->value,
                    'label' => $enum->value, // Fallback to value
                ];
                continue;
            }

            // Fallback for unexpected types
            $stringValue = (string) $enum;
            $result[] = [
                'value' => $stringValue,
                'label' => $stringValue,
            ];
        }
        
        return $result;
    }
}