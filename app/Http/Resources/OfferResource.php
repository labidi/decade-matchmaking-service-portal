<?php

namespace App\Http\Resources;

use App\Enums\Offer\RequestOfferStatus;
use App\Models\Request\Offer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;

/**
 * @mixin Offer
 */
class OfferResource extends JsonResource
{
    public static $wrap = null;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $baseData = [
            'id' => $this->id,
            'description' => $this->description,
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
            ],
            'is_accepted' => $this->is_accepted,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Relationships
            'request' => $this->whenLoaded('request', function () {
                return new RequestResource($this->request);
            }),
            'matched_partner' => $this->whenLoaded('matchedPartner'),
            'documents' => $this->whenLoaded('documents')
        ];

        $baseData['permissions'] = [
            'can_view' => $request->user()->can('view', [Offer::class, $this->resource]),
            'can_edit' => $request->user()->can('update', [Offer::class, $this->resource]),
            'can_enable' => $request->user()->can('canEnableOrDisable', [Offer::class, $this->resource]),
            'can_disable' => $request->user()->can('canEnableOrDisable', [Offer::class, $this->resource]),
            'can_delete' => $request->user()->can('delete', [Offer::class, $this->resource]),
            'can_accept' => $request->user()->can('accept', [Offer::class, $this->resource]),
            'can_reject' => $request->user()->can('reject', [Offer::class, $this->resource]),
            'can_request_clarifications' => $request->user()->can(
                'requestClarifications',
                [Offer::class, $this->resource]
            ),
            'can_manage_documents' => $request->user()->can('manageDocuments', [Offer::class, $this->resource]),
        ];

        return $baseData;
    }
}
