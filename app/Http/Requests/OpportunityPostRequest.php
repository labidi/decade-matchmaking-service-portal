<?php

namespace App\Http\Requests;

use App\Enums\Common\Language;
use App\Enums\Common\TargetAudience;
use App\Enums\Opportunity\Type;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OpportunityPostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Allow authenticated users to create opportunities
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::enum(Type::class)],
            'closing_date' => ['required', 'date',Rule::date()->after('today')],
            'coverage_activity' => ['required'],
            'implementation_location' => ['required'],
            'target_audience' => ['required', 'array'],
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
            'summary' => ['required'],
            'url' => ['required'],
            'key_words' => ['required', 'array', 'max:255'],
        ];
    }

    /**
     * Get custom attribute names for validation errors.
     */
    public function attributes(): array
    {
        return [
            'title' => 'title',
            'type' => 'type',
            'closing_date' => 'closing date',
            'coverage_activity' => 'coverage activity',
            'implementation_location' => 'implementation location',
            'target_audience' => 'target audience',
            'summary' => 'summary',
            'url' => 'URL',
        ];
    }
}
