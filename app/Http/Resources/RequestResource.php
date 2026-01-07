<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Request as RequestModel;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Pure data transformation resource for Request.
 *
 * Note: Actions are NOT included here. They are passed separately
 * from the controller to maintain Single Responsibility Principle.
 *
 * @mixin RequestModel
 */
class RequestResource extends JsonResource
{
    public static $wrap = null;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Eager load relationships to avoid N+1 queries
        $this->resource->loadMissing(['activeOffer', 'matchedPartner', 'user', 'offers']);
        $user = $request->user();

        return [
            'id' => $this->id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // Relationships
            'active_offer' => $user?->can('viewActiveOffer', $this->resource)
                ? $this->whenLoaded('activeOffer', fn ($offer) => new OfferResource($offer))
                : null,
            'status' => $this->whenLoaded('status'),
            'user' => $this->whenLoaded('user'),
            'matched_partner' => $this->whenLoaded('matchedPartner'),
            'offers' => $this->getAuthorizedOffers($request),
            'detail' => new DetailResource($this->whenLoaded('detail')),
            'subscriptions' => $this->whenLoaded('subscriptions'),
            'subscribers' => $this->whenLoaded('subscribers'),
            // NO 'actions' key - handled by controller
        ];
    }

    /**
     * Get offers that the current user is authorized to view.
     *
     * @return AnonymousResourceCollection|null
     */
    private function getAuthorizedOffers(Request $request): ?AnonymousResourceCollection
    {
        if (! $this->relationLoaded('offers') || ! $request->user()?->can('viewOffers', $this->resource)) {
            return null;
        }

        return OfferResource::collection($this->whenLoaded('offers'));
    }
}