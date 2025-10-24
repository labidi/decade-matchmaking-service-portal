<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;

/**
 * Public Request Resource
 *
 * Extends RequestResource to provide simplified status labels for public-facing request lists.
 * Maps technical status codes to user-friendly labels:
 * - 'validated' → 'Matching Ongoing'
 * - 'offer_made', 'in_implementation', 'closed' → 'Matching Closed'
 */
class PublicRequestResource extends RequestResource
{
    /**
     * Transform the resource into an array with simplified status labels.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        // Transform status label if status is loaded
        if (isset($data['status']) && is_object($data['status'])) {
            $data['status'] = $this->transformStatus($data['status']);
        }

        return $data;
    }

    /**
     * Transform status object to use simplified labels for public display.
     *
     * @param object $status
     * @return object
     */
    private function transformStatus(object $status): object
    {
        $statusCode = $status->status_code ?? '';

        // Map technical status codes to public-friendly labels
        $statusLabel = match ($statusCode) {
            'validated' => 'Matching Ongoing',
            'offer_made', 'in_implementation', 'closed' => 'Matching Closed',
            default => $status->status_label ?? $statusCode,
        };

        // Clone the status object and update the label
        $transformedStatus = clone $status;
        $transformedStatus->status_label = $statusLabel;

        return $transformedStatus;
    }
}
