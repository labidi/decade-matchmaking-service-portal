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
            'status_id' => $this->status_id,
            'user_id' => $this->user_id,
            'matched_partner_id' => $this->matched_partner_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Computed attributes
            'title' => $this->title,
            'requester_name' => $this->requester_name,
            'active_offer' => $this->active_offer,
            
            // Relationships
            'status' => $this->whenLoaded('status'),
            'user' => $this->whenLoaded('user'),
            'matched_partner' => $this->whenLoaded('matchedPartner'),
            'offers' => $this->whenLoaded('offers'),
            'detail' => $this->whenLoaded('detail'),
            'subscriptions' => $this->whenLoaded('subscriptions'),
            'subscribers' => $this->whenLoaded('subscribers'),
        ];

        // Include permissions if they were set
        if ($this->permissions !== null) {
            $baseData['permissions'] = $this->permissions;
            
            // Also include legacy format for backward compatibility
            $baseData['can_edit'] = $this->permissions['can_edit'] ?? false;
            $baseData['can_view'] = $this->permissions['can_view'] ?? false;
            $baseData['can_manage_offers'] = $this->permissions['can_manage_offers'] ?? false;
            $baseData['can_update_status'] = $this->permissions['can_update_status'] ?? false;
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

    /**
     * Create a collection with permissions for each item.
     */
    public static function collectionWithPermissions($resources, array $permissionsByRequestId): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return static::collection($resources)->map(function (RequestResource $resource) use ($permissionsByRequestId) {
            $requestId = $resource->resource->id;
            if (isset($permissionsByRequestId[$requestId])) {
                $resource->setPermissions($permissionsByRequestId[$requestId]);
            }
            return $resource;
        });
    }

    /**
     * Transform the resource for admin context.
     */
    public function forAdmin(array $adminPermissions): array
    {
        $this->setPermissions($adminPermissions);
        
        $data = $this->toArray(request());
        
        // Add admin-specific fields
        $data['admin_actions'] = [
            'can_manage_offers' => $adminPermissions['can_manage_offers'] ?? false,
            'can_update_status' => $adminPermissions['can_update_status'] ?? false,
            'can_view_all_details' => true, // Admins can always view all details
        ];

        return $data;
    }

    /**
     * Transform the resource for user context.
     */
    public function forUser(array $userPermissions): array
    {
        $this->setPermissions($userPermissions);
        
        $data = $this->toArray(request());
        
        // Add user-specific fields
        $data['user_actions'] = [
            'can_accept_offer' => $userPermissions['can_accept_offer'] ?? false,
            'can_request_clarifications' => $userPermissions['can_request_clarifications'] ?? false,
            'can_withdraw' => $userPermissions['can_withdraw'] ?? false,
        ];

        return $data;
    }

    /**
     * Transform for the public view (minimal data).
     */
    public function forPublic(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'status' => $this->whenLoaded('status', function () {
                return [
                    'status_code' => $this->status->status_code,
                    'status_label' => $this->status->status_label,
                ];
            }),
            'created_at' => $this->created_at,
            'has_active_offer' => $this->active_offer !== null,
        ];
    }

    /**
     * Transform for API responses with enhanced detail.
     */
    public function forApi(): array
    {
        $data = $this->toArray(request());
        
        // Add API-specific metadata
        $data['meta'] = [
            'has_offers' => $this->offers->count() > 0,
            'has_active_offer' => $this->active_offer !== null,
            'subscriber_count' => $this->whenLoaded('subscribers', 
                fn() => $this->subscribers->count(), 
                0
            ),
        ];

        return $data;
    }
}