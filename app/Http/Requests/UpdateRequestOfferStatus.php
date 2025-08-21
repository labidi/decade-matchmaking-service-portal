<?php

namespace App\Http\Requests;

use App\Enums\Offer\RequestOfferStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class UpdateRequestOfferStatus extends BaseOfferRequest
{

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'status' => [
                'required',
                Rule::enum(RequestOfferStatus::class)
            ],
        ];
    }

    /**
     * Get additional custom messages specific to status updates
     */
    protected function getCustomMessages(): array
    {
        return [
            'status.required' => 'The status is required.',
            'status.integer' => 'The status must be a valid integer.',
            'status.in' => 'The selected status is invalid.',
        ];
    }

    /**
     * Get additional custom attributes specific to status updates
     */
    protected function getCustomAttributes(): array
    {
        return [
            'status' => 'offer status',
        ];
    }
}
