<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreRequestOffer extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'description' => [
                'required',
                'string',
                'min:10',
                'max:1000',
            ],
            'partner_id' => [
                'required',
                'string',
                'min:3',
                'max:255',
                'regex:/^[a-zA-Z0-9\-\_\.]+$/', // Alphanumeric, hyphens, underscores, dots
            ],
            'document' => [
                'required',
                'file',
                'mimes:pdf',
                'max:10240', // 10MB max
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'description.required' => 'The offer description is required.',
            'description.min' => 'The offer description must be at least :min characters.',
            'description.max' => 'The offer description may not be greater than :max characters.',
            'partner_id.required' => 'The partner ID is required.',
            'partner_id.min' => 'The partner ID must be at least :min characters.',
            'partner_id.max' => 'The partner ID may not be greater than :max characters.',
            'partner_id.regex' => 'The partner ID may only contain letters, numbers, hyphens, underscores, and dots.',
            'document.required' => 'A document file is required.',
            'document.file' => 'The document must be a valid file.',
            'document.mimes' => 'The document must be a PDF file.',
            'document.max' => 'The document may not be greater than :max kilobytes.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'description' => 'offer description',
            'partner_id' => 'partner ID',
            'document' => 'document file',
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     *
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422)
        );
    }

    /**
     * Handle a failed authorization attempt.
     *
     * @return void
     *
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    protected function failedAuthorization()
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'error' => 'You are not authorized to perform this action.',
            ], 403)
        );
    }
} 