<?php

namespace App\Http\Requests;

use App\Enums\Common\Language;
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
        $rules = [];
        if ($this->input('mode') === 'draft') {
            return $rules;
        }

        $rules = [
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
            // need to be fixed when no and yes
            'project_stage' => [
                Rule::excludeIf(
                    fn() => $this->input("is_related_decade_action") === YesNo::YES->value || $this->input(
                            "request_link_type"
                        ) === YesNo::YES->value
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
            'target_languages' => ['required', 'array'],
            'target_languages.*' => [Rule::enum(Language::class)],
            'target_languages_other' => [
                Rule::excludeIf(fn() => !in_array(Language::OTHER->value, $this->input('target_languages', []))),
                'string'
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
            'has_partner' => [Rule::enum(YesNo::class)],
            'partner_name' => [
                Rule::excludeIf(fn() => $this->input("has_partner") === YesNo::NO->value)
            ],
            'partner_confirmed' => [Rule::requiredIf(fn() => $this->input("has_partner") === 'Yes')],
            'needs_financial_support' => ['required', Rule::enum(YesNo::class)],
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
        return $rules;
    }
}
