<?php

namespace App\Http\Requests;

use App\Models\Setting;
use Illuminate\Foundation\Http\FormRequest;

class SettingsPostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Allow authorized users to update settings
        // You can implement more specific authorization logic here
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     * Only validate fields that are actually present in the request for optimization.
     */
    public function rules(): array
    {
        $rules = [];
        $allValidationRules = [
            Setting::SITE_NAME => ['nullable', 'string', 'max:255'],
            Setting::SITE_DESCRIPTION => ['nullable', 'string', 'max:1000'],
            Setting::HOMEPAGE_YOUTUBE_VIDEO => ['nullable', 'string', 'max:500'],
            Setting::SUCCESSFUL_MATCHES_METRIC => ['nullable', 'integer'],
            Setting::COMMITTED_FUNDING_METRIC => ['nullable', 'integer'],
            Setting::FULLY_CLOSED_MATCHES_METRIC => ['nullable', 'integer'],
            Setting::REQUEST_IN_IMPLEMENTATION_METRIC => ['nullable', 'integer'],
            Setting::OPEN_PARTNER_OPPORTUNITIES_METRIC => ['nullable', 'integer'],
            Setting::PORTAL_GUIDE => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            Setting::USER_GUIDE => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            Setting::PARTNER_GUIDE => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            Setting::ORGANIZATIONS_CSV => ['nullable', 'file', 'mimes:csv,txt', 'max:10240'],
        ];

        // Only apply validation rules for fields that are present in the request
        // This supports optimized submissions with only changed fields
        foreach ($allValidationRules as $field => $rule) {
            if ($this->has($field) || $this->hasFile($field)) {
                $rules[$field] = $rule;
            }
        }

        return $rules;
    }

    /**
     * Get custom attribute names for validation errors.
     */
    public function attributes(): array
    {
        return [
            'logo' => 'logo',
            'portal_guide' => 'portal guide',
            'user_guide' => 'user guide',
            'partner_guide' => 'partner guide',
            'site_name' => 'site name',
            'site_description' => 'site description',
            'homepage_youtube_video' => 'YouTube video URL',
            'successful_matches_metric' => 'successful matches',
            'committed_funding_metric' => 'committed funding',
            'fully_closed_matches_metric' => 'fully closed matches',
            'request_in_implementation_metric' => 'requests in implementation',
            'open_partner_opportunities_metric' => 'open partner opportunities',
        ];
    }
}
