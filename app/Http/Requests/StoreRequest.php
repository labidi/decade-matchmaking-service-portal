<?php

namespace App\Http\Requests;

use App\Enums\Common\Country;
use App\Enums\Common\Language;
use App\Enums\Common\TargetAudience;
use App\Enums\Common\YesNo;
use App\Enums\Request\SubTheme;
use App\Enums\Request\SupportType;
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
        $rules = $this->getBaseValidationRules();
        if ($this->input('mode') === 'draft') {
            return $rules;
        }
        return array_merge($rules, [
            'is_related_decade_action' => [
                'required',
                Rule::enum(YesNo::class)
            ],
            'unique_related_decade_action_id' => [
                Rule::excludeIf(
                    fn() => $this->input("is_related_decade_action") === YesNo::NO->value
                ),
                'string'
            ],
            'first_name' => ['required', 'string'],
            'last_name' => ['required', 'string'],
            'email' => ['required', 'email'],
            'capacity_development_title' => ['required', 'string'],
            'request_link_type' => [
                Rule::excludeIf(
                    fn() => $this->input("is_related_decade_action") === YesNo::YES->value
                ),
                Rule::enum(YesNo::class)
            ],
            'project_stage' => [
                Rule::excludeIf(
                    fn() => $this->input("request_link_type") === YesNo::NO->value || is_null(
                            $this->input("request_link_type")
                        )
                ),
                'string'
            ],
            'project_url' => [
                Rule::excludeIf(
                    fn() => $this->input("request_link_type") === YesNo::YES->value
                        || $this->input("is_related_decade_action") === YesNo::YES->value
                ),
                'url'
            ],
            'related_activity' => ['required'],
            'delivery_format' => ['required'],
            'delivery_countries' => [
                Rule::requiredIf(
                    fn() => $this->input("request_link_type") !== 'Online'
                )
            ],
            'delivery_countries.*' => [Rule::enum(Country::class)],
            'target_audience' => [
                Rule::requiredIf(
                    fn() => $this->input("request_link_type") !== 'Online'
                ),
                'array'
            ],
            'target_audience.*' => [Rule::enum(TargetAudience::class)],
            'target_audience_other' => [
                Rule::excludeIf(fn() => !in_array(TargetAudience::OTHER->value, $this->input('target_audience', []))),
                'string'
            ],
            'target_languages' => ['required'],
            'target_languages.*' => [Rule::enum(Language::class)],
            'target_languages_other' => [
                Rule::excludeIf(fn() => !in_array(Language::OTHER->value, $this->input('target_languages', []))),
                'string'
            ],
            'subthemes' => ['required'],
            'subthemes.*' => [Rule::enum(SubTheme::class)],
            'support_types' => ['required', 'array'],
            'support_types.*' => [Rule::enum(SupportType::class)],
            'gap_description' => ['required', 'string'],
            'has_partner.*' => [Rule::enum(YesNo::class)],
            'partner_name' => [
                Rule::excludeIf(fn() => $this->input("has_partner") === YesNo::NO->value)
            ],
            'partner_confirmed' => [Rule::requiredIf(fn() => $this->input("has_partner") === YesNo::YES->value)],
            'needs_financial_support.*' => ['required', Rule::enum(YesNo::class)],
            'budget_breakdown' => [
                Rule::requiredIf(
                    fn() => $this->input("needs_financial_support") === YesNo::YES->value
                ),
            ],
            'support_months' => ['required', 'numeric'],
            'completion_date' => ['required', 'string'],
            'risks' => ['required', 'string'],
            'personnel_expertise' => ['required', 'string'],
            'direct_beneficiaries' => ['required', 'string'],
            'direct_beneficiaries_number' => ['required', 'numeric'],
            'expected_outcomes' => ['required', 'string'],
            'success_metrics' => ['required', 'string'],
            'long_term_impact' => ['required', 'string'],
        ]);
    }

    private function getBaseValidationRules()
    {
        return [
            'is_related_decade_action' => [],
            'unique_related_decade_action_id' => [],
            'first_name' => [],
            'last_name' => [],
            'email' => [],
            'capacity_development_title' => [],
            'request_link_type' => [],
            'project_stage' => [],
            'project_url' => [],
            'related_activity' => [],
            'delivery_format' => [],
            'delivery_countries' => [],
            'target_audience' => [],
            'target_audience_other' => [],
            'target_languages' => [],
            'target_languages.*' => [],
            'target_languages_other' => [],
            'subthemes' => [],
            'subthemes.*' => [],
            'support_types' => [],
            'support_types.*' => [],
            'gap_description' => [],
            'has_partner' => [],
            'partner_name' => [],
            'partner_confirmed' => [],
            'needs_financial_support' => [],
            'budget_breakdown' => [],
            'support_months' => [],
            'completion_date' => [],
            'risks' => [],
            'personnel_expertise' => [],
            'direct_beneficiaries' => [],
            'direct_beneficiaries_number' => [],
            'expected_outcomes' => [],
            'success_metrics' => [],
            'long_term_impact' => [],
        ];
    }
}
