<?php

namespace App\Http\Resources;

use App\Models\Request as RequestModel;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin RequestModel
 */
class RequestResource extends JsonResource
{
    public static $wrap = null;
    /**
     * Permissions to include in the response
     */
    private ?array $permissions = null;

    /**
     * Set permissions to be included in the response.
     */
    public function setPermissions(array $permissions): static
    {
        $this->permissions = $permissions;
        return $this;
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $baseData = [
            'id' => $this->id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // Relationships
            'active_offer' => $this->whenLoaded('activeOffer'),
            'status' => $this->whenLoaded('status'),
            'user' => $this->whenLoaded('user'),
            'matched_partner' => $this->whenLoaded('matchedPartner'),
            'offers' => $this->whenLoaded('offers'),
            'detail' => new DetailResource($this->whenLoaded('detail')),
            'subscriptions' => $this->whenLoaded('subscriptions'),
            'subscribers' => $this->whenLoaded('subscribers'),
        ];

        // Include permissions if they were set
        if ($this->permissions !== null) {
            $baseData['permissions'] = $this->permissions;
        }

        return $baseData;
    }

    /**
     * Create a new resource instance with permissions.
     */
    public static function withPermissions($resource, array $permissions): static
    {
        return (new static($resource))->setPermissions($permissions);
    }
}
