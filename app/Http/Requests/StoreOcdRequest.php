<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOcdRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        if ($this->input('mode') === 'draft') {
            return [];
        }
        return [
            'is_related_decade_action' => ['required', Rule::in(['Yes', 'No'])],
            'unique_related_decade_action_id' => ['required_if:is_related_decade_action,Yes', 'string'],
            'first_name' => ['required', 'string'],
            'last_name' => ['required', 'string'],
            'email' => ['required', 'email'],
            'capacity_development_title' => ['required', 'string'],
            'request_link_type' => ['required_unless:is_related_decade_action,Yes', 'string'],
            'project_stage' => ['required_unless:is_related_decade_action,Yes', 'string'],
            'project_url' => ['nullable', 'url'],
            'activity_name' => ['required_unless:is_related_decade_action,Yes', 'string'],
            'related_activity' => ['required', Rule::in(['Training', 'Workshop', 'Both'])],
            'subthemes' => ['required', 'array'],
            'subthemes.*' => ['string'],
            'support_types' => ['required', 'array'],
            'support_types.*' => ['string'],
            'gap_description' => ['required', 'string'],
            'has_partner' => ['required', Rule::in(['Yes', 'No'])],
            'needs_financial_support' => ['required', Rule::in(['Yes', 'No'])],
            'budget_breakdown' => ['required_if:needs_financial_support,Yes', 'string'],
            'support_months' => ['required_if:needs_financial_support,Yes', 'integer'],
            'completion_date' => ['required_if:needs_financial_support,Yes', 'date'],
            'risks' => ['required', 'string'],
            'personnel_expertise' => ['required', 'string'],
            'direct_beneficiaries' => ['required', 'string'],
            'direct_beneficiaries_number' => ['required', 'numeric'],
            'expected_outcomes' => ['required', 'string'],
            'success_metrics' => ['required', 'string'],
            'long_term_impact' => ['required', 'string'],
        ];
    }
}
