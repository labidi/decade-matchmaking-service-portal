<?php

namespace App\Http\Requests;

use App\Enums\SubTheme;
use App\Enums\SupportType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequest extends FormRequest
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
            'unique_related_decade_action_id' => [
                Rule::requiredIf(
                    fn() => $this->input("is_related_decade_action") === 'Yes'
                ),
                'string'
            ],
            'first_name' => ['required', 'string'],
            'last_name' => ['required', 'string'],
            'email' => ['required', 'email'],
            'capacity_development_title' => ['required', 'string'],
            'request_link_type' => [
                Rule::requiredIf(
                    fn() => $this->input("is_related_decade_action") === 'Yes'
                ),
                'string'
            ],
            'project_stage' => [
                Rule::requiredIf(
                    fn() => $this->input("request_link_type") === 'Yes' && $this->input("is_related_decade_action") === 'Yes'
                ),
                'string'
            ],
            'project_url' => ['required', 'url'],
            'related_activity' => ['required'],
            'delivery_format' => ['required'],
            'delivery_countries' => [
                Rule::requiredIf(
                    fn() => $this->input("request_link_type") !== 'Online'
                ),
                'array'
            ],
            'target_audience' => [
                Rule::requiredIf(
                    fn() => $this->input("request_link_type") !== 'Online'
                ),
                'array'
            ],
            'target_audience_other' => [
                Rule::requiredIf(
                    fn() => $this->input("target_audience") === 'Other (Please Specify)'
                ),
            ],
            'subthemes' => ['required', 'array'],
            'subthemes.*' => [
                Rule::in(
                    array_column(
                        SubTheme::getOptions(),
                        'value'
                    )
                )
            ],
            'support_types' => ['required', 'array'],
            'support_types.*' => [
                Rule::in(
                    array_column(
                        SupportType::getOptions(),
                        'value'
                    )
                )
            ],
            'gap_description' => ['required', 'string'],
            'has_partner' => ['required', Rule::in(['Yes', 'No'])],
            'partner_name' => [Rule::requiredIf(fn() => $this->input("has_partner") === 'Yes')],
            'partner_confirmed' => [Rule::requiredIf(fn() => $this->input("has_partner") === 'Yes')],
            'needs_financial_support' => ['required', Rule::in(['Yes', 'No'])],
            'budget_breakdown' => [Rule::requiredIf(fn() => $this->input("needs_financial_support") === 'Yes')],
            'support_months' => ['required', 'numeric'],
            'completion_date' => ['required', 'string'],
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
