<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'type' => ['required', 'string'],
            'closing_date' => ['required', 'string', 'max:255'],
            'coverage_activity' => ['required'],
            'implementation_location' => ['required'],
            'target_audience' => ['required'],
            'summary' => ['required'],
            'url' => ['required'],
            'key_words' => ['required', 'string', 'max:255'],
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
