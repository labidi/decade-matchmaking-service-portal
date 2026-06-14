<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Request\Offer;
use App\Services\Actions\OfferActionProvider;
use Illuminate\Http\Request;

/**
 * @mixin Offer
 */
class OfferResource extends BaseResource
{
    protected function actionProvider(): ?string
    {
        return OfferActionProvider::class;
    }

    /**
     * @return array<string, mixed>
     */
    protected function fields(Request $request): array
    {
        return [
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
            'documents' => $this->whenLoaded('documents', function () {
                return DocumentResource::collection($this->documents);
            }),
        ];
    }
}
